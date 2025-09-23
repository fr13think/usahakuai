import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { AgentRouter, AgentContext, AgentType, ChatMessage } from '@/lib/ai-agents';
import Groq from 'groq-sdk';

interface ChatRequest {
  query: string;
  conversationHistory?: ChatMessage[];
  selectedAgent?: AgentType | null;
  userProfile?: {
    businessType?: string;
    industry?: string;
    experience?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to access Chat AI.' },
        { status: 401 }
      );
    }

    const body: ChatRequest = await request.json();
    const { query, conversationHistory, selectedAgent, userProfile } = body;

    // Validate input
    if (!query?.trim()) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Get user's uploaded documents for context (RAG)
    let documentContext: string[] = [];
    try {
      const { data: documents } = await supabase
        .from('document_analyses')
        .select('file_name, summary')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (documents && documents.length > 0) {
        documentContext = documents.map(doc => 
          `Document: ${doc.file_name} - Summary: ${doc.summary?.substring(0, 1000) || 'No content available'}`
        );
      }
    } catch (docError) {
      console.error('Error fetching user documents:', docError);
    }

    // Get user profile if not provided
    let effectiveUserProfile = userProfile;
    if (!effectiveUserProfile) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          effectiveUserProfile = {
            businessType: profile.business_type || undefined,
            industry: undefined, // Field not available in current schema
            experience: undefined, // Field not available in current schema
          };
        }
      } catch (profileError) {
        console.error('Error fetching user profile:', profileError);
      }
    }

    // Initialize Groq client server-side
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'AI service tidak tersedia. GROQ_API_KEY tidak dikonfigurasi.' },
        { status: 503 }
      );
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    // Prepare agent context
    const context: AgentContext = {
      userQuery: query,
      conversationHistory: conversationHistory || [],
      documentContext,
      userProfile: effectiveUserProfile,
    };

    let agentResponse;
    let selectedAgentType: AgentType;

    if (selectedAgent) {
      // Use the specifically selected agent
      selectedAgentType = selectedAgent;
      agentResponse = await AgentRouter.processWithAgent(selectedAgent, context, groq);
    } else {
      // Auto-route to the most appropriate agent
      const routedAgent = await AgentRouter.route(context);
      selectedAgentType = routedAgent.type;
      agentResponse = await routedAgent.process(context, groq);
    }

    // Save conversation to database
    try {
      await supabase.from('chat_conversations').insert({
        user_id: user.id,
        agent_type: selectedAgentType,
        user_query: query,
        agent_response: agentResponse.response,
        metadata: {
          confidence: agentResponse.confidence,
          sources: agentResponse.sources,
          conversation_length: (conversationHistory?.length || 0) + 1,
          document_context_used: documentContext.length > 0,
          user_profile_available: !!effectiveUserProfile,
          handoff_to: agentResponse.handoffTo,
          handoff_reason: agentResponse.handoffReason,
        }
      });
    } catch (saveError) {
      // Don't fail the request if saving fails
      console.warn('Failed to save conversation to database:', saveError);
    }

    return NextResponse.json({
      response: agentResponse.response,
      agentType: selectedAgentType,
      sources: agentResponse.sources,
      confidence: agentResponse.confidence,
      handoffTo: agentResponse.handoffTo,
      handoffReason: agentResponse.handoffReason,
      metadata: {
        documentsUsed: documentContext.length,
        userProfileUsed: !!effectiveUserProfile,
      }
    });

  } catch (error) {
    console.error('Chat AI API error:', error);
    
    return NextResponse.json(
      { 
        error: 'An error occurred while processing your message.',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}