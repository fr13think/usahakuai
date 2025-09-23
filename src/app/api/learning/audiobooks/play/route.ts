import { NextResponse } from 'next/server';
import { createServerClient as createClient } from '@/lib/supabase/server';
import { updatePlayCount } from '@/lib/supabase/learning-audiobooks';

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

    const { audiobookId } = await request.json();

    if (!audiobookId) {
      return NextResponse.json(
        { error: 'Audiobook ID is required' },
        { status: 400 }
      );
    }

    await updatePlayCount(audiobookId);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating play count:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to update play count',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}