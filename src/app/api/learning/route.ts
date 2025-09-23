import { NextResponse } from 'next/server';
import { createServerClient as createClient } from '@/lib/supabase/server';
import { getAudiobooksByUserId } from '@/lib/supabase/learning-audiobooks';
import { getCoursesByUserId } from '@/lib/supabase/learning-courses';
import { Database } from '@/lib/supabase/database.types';

type AudiobookRow = Database['public']['Tables']['learning_audiobooks']['Row'];
type CourseRow = Database['public']['Tables']['learning_courses']['Row'];

export async function GET(request: Request) {
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

    const url = new URL(request.url);
    const contentType = url.searchParams.get('type');

    if (contentType && !['audiobook', 'course'].includes(contentType)) {
      return NextResponse.json(
        { error: 'Invalid content type. Must be "audiobook" or "course"' },
        { status: 400 }
      );
    }

    const result: { audiobooks?: AudiobookRow[]; courses?: CourseRow[] } = {};

    if (!contentType || contentType === 'audiobook') {
      try {
        result.audiobooks = await getAudiobooksByUserId(user.id);
      } catch (error) {
        console.error('Error fetching audiobooks:', error);
        result.audiobooks = [];
      }
    }

    if (!contentType || contentType === 'course') {
      try {
        result.courses = await getCoursesByUserId(user.id);
      } catch (error) {
        console.error('Error fetching courses:', error);
        result.courses = [];
      }
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error fetching learning content:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch learning content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}