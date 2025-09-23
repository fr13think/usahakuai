import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { ChatMessage } from '@/lib/ai-agents';
import { Json } from '@/lib/supabase/database.types';

interface SaveChatRequest {
  messages: ChatMessage[];
  title: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to save chat history.' },
        { status: 401 }
      );
    }

    const body: SaveChatRequest = await request.json();
    const { messages, title } = body;

    // Validate input
    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages are required to save chat history.' },
        { status: 400 }
      );
    }

    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Title is required to save chat history.' },
        { status: 400 }
      );
    }

    // Calculate conversation statistics
    const userMessages = messages.filter(m => m.role === 'user').length;
    const agentMessages = messages.filter(m => m.role === 'agent').length;
    const uniqueAgents = [...new Set(messages.filter(m => m.agentType).map(m => m.agentType))]
      .filter(Boolean) as string[];

    // Save chat session to database
    const sessionData = {
      user_id: user.id,
      title: title.trim(),
      messages: messages as unknown as Json,
      message_count: messages.length,
      user_message_count: userMessages,
      agent_message_count: agentMessages,
      agents_used: uniqueAgents,
    };

    const { data, error } = await supabase
      .from('chat_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (error) {
      console.error('Error saving chat session:', error);
      return NextResponse.json(
        { error: 'Failed to save chat history. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sessionId: data.id,
      title: data.title,
      messageCount: data.message_count,
      savedAt: data.created_at
    });

  } catch (error) {
    console.error('Chat history API error:', error);
    
    return NextResponse.json(
      { 
        error: 'An error occurred while saving chat history.',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to access chat history.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      // Get specific chat session
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('id', sessionId)
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Chat session not found.' },
          { status: 404 }
        );
      }

      return NextResponse.json(data);
    } else {
      // Get chat history list
      const { data, error, count } = await supabase
        .from('chat_sessions')
        .select('id, title, message_count, agents_used, created_at, updated_at', { count: 'exact' })
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching chat history:', error);
        return NextResponse.json(
          { error: 'Failed to fetch chat history.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        sessions: data || [],
        total: count || 0,
        limit,
        offset
      });
    }

  } catch (error) {
    console.error('Chat history GET API error:', error);
    
    return NextResponse.json(
      { 
        error: 'An error occurred while fetching chat history.',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to delete chat history.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required to delete chat history.' },
        { status: 400 }
      );
    }

    // Delete chat session
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('user_id', user.id)
      .eq('id', sessionId);

    if (error) {
      console.error('Error deleting chat session:', error);
      return NextResponse.json(
        { error: 'Failed to delete chat session.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Chat session deleted successfully.'
    });

  } catch (error) {
    console.error('Chat history DELETE API error:', error);
    
    return NextResponse.json(
      { 
        error: 'An error occurred while deleting chat history.',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}