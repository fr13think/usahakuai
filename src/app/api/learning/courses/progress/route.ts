import { NextResponse } from 'next/server';
import { createServerClient as createClient } from '@/lib/supabase/server';
import { updateCourseProgress } from '@/lib/supabase/learning-courses';

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

    const { courseId, progress } = await request.json();

    if (!courseId || typeof progress !== 'number') {
      return NextResponse.json(
        { error: 'Course ID and progress percentage are required' },
        { status: 400 }
      );
    }

    if (progress < 0 || progress > 100) {
      return NextResponse.json(
        { error: 'Progress must be between 0 and 100' },
        { status: 400 }
      );
    }

    await updateCourseProgress(courseId, progress);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating course progress:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to update course progress',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}