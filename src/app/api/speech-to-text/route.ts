import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to access speech-to-text.' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Validate file type and size
    if (!audioFile.type.startsWith('audio/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an audio file.' },
        { status: 400 }
      );
    }

    // Limit file size to 10MB
    if (audioFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    try {
      // Process audio using Groq Whisper (server-side fallback)
      // Note: Primary speech recognition should use Web Speech API client-side
      const transcriptionText = await processAudioWithFallback(audioFile);

      return NextResponse.json({
        text: transcriptionText,
        language: 'id',
        confidence: 0.95,
        processed_at: new Date().toISOString()
      });

    } catch (processingError) {
      console.error('Audio processing error:', processingError);
      return NextResponse.json(
        { error: 'Failed to process audio. Please try again.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Speech-to-text API error:', error);
    
    return NextResponse.json(
      { 
        error: 'An error occurred while processing the audio.',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

// Server-side audio processing function (fallback only)
async function processAudioWithFallback(audioFile: File): Promise<string> {
  // Use Groq Whisper (if available)
  if (process.env.GROQ_API_KEY) {
    try {
      return await processWithGroqWhisper(audioFile);
    } catch (error) {
      console.error('Groq Whisper failed:', error);
      throw new Error('Server-side speech processing failed. Please use Web Speech API in browser.');
    }
  }

  // No server-side service available
  throw new Error('No server-side speech-to-text service available. Please configure GROQ_API_KEY, or use Web Speech API in browser.');
}

async function processWithGroqWhisper(audioFile: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', audioFile);
  formData.append('model', 'whisper-large-v3');
  formData.append('language', 'id'); // Indonesian
  formData.append('response_format', 'json');

  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq Whisper API error: ${error}`);
  }

  const result = await response.json();
  return result.text || '';
}

// Note: For Indonesian speech recognition, we recommend:
// 1. Web Speech API (client-side) - Primary method, works well with Indonesian
// 2. Groq Whisper API (server-side) - Fallback option with excellent multilingual support
// 
// OpenAI API is not used in this implementation to keep dependencies minimal.
