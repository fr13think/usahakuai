import { NextResponse } from 'next/server';
import { createServerClient as createClient } from '@/lib/supabase/server';
import { generateLearningContent } from '@/ai/flows/generate-learning-content';
import { createAudiobook, getAudiobooksByUserId } from '@/lib/supabase/learning-audiobooks';
import { createCourse, getCoursesByUserId } from '@/lib/supabase/learning-courses';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const { contentType } = await request.json();

    if (!contentType || !['audiobook', 'course'].includes(contentType)) {
      return NextResponse.json(
        { error: 'Invalid content type. Must be "audiobook" or "course"' },
        { status: 400 }
      );
    }

    // Get existing titles to avoid duplication
    let existingTitles: string[] = [];
    
    try {
      if (contentType === 'audiobook') {
        const audiobooks = await getAudiobooksByUserId(user.id);
        existingTitles = audiobooks.map(book => book.title);
      } else {
        const courses = await getCoursesByUserId(user.id);
        existingTitles = courses.map(course => course.title);
      }
    } catch (error) {
      console.warn('Could not fetch existing content, proceeding without duplicate check:', error);
      existingTitles = [];
    }

    // Generate new content using Llama Groq
    const generatedContent = await generateLearningContent({
      contentType: contentType as 'audiobook' | 'course',
      existingTitles
    });

    // Save to database
    let savedContent;
    
    if (contentType === 'audiobook') {
      savedContent = await createAudiobook({
        user_id: user.id,
        title: generatedContent.title,
        description: generatedContent.description,
        content: generatedContent.content,
        // Audio will be generated later when user first plays it
        audio_url: null,
        duration_minutes: null,
        is_favorite: false,
        play_count: 0
      });
    } else {
      savedContent = await createCourse({
        user_id: user.id,
        title: generatedContent.title,
        description: generatedContent.description,
        content: generatedContent.content,
        chapters: generatedContent.chapters || null,
        progress_percentage: 0,
        is_completed: false,
        is_favorite: false
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: savedContent.id,
        title: savedContent.title,
        description: savedContent.description,
        content: savedContent.content,
        ...(contentType === 'course' && 'chapters' in savedContent && { chapters: savedContent.chapters }),
        created_at: savedContent.created_at
      }
    });

  } catch (error) {
    console.error('Error generating learning content:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate learning content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}