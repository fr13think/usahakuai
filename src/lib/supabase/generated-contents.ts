import { createServerClient } from './server';
import type { Database } from './database.types';

type GeneratedContent = Database['public']['Tables']['generated_contents']['Row'];

export async function createGeneratedContent(data: {
  user_id: string;
  file_name?: string;
  file_size?: number;
  title: string;
  description: string;
  hashtags: string[];
  content_type?: string;
}): Promise<GeneratedContent> {
  const supabase = await createServerClient();
  
  const { data: content, error } = await supabase
    .from('generated_contents')
    .insert({
      user_id: data.user_id,
      file_name: data.file_name,
      file_size: data.file_size,
      title: data.title,
      description: data.description,
      hashtags: data.hashtags,
      content_type: data.content_type || 'sales_content'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating generated content:', error);
    throw new Error('Failed to save generated content');
  }

  return content;
}

export async function getGeneratedContents(userId: string): Promise<GeneratedContent[]> {
  const supabase = await createServerClient();
  
  const { data: contents, error } = await supabase
    .from('generated_contents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching generated contents:', error);
    throw new Error('Failed to fetch generated contents');
  }

  return contents || [];
}

export async function getGeneratedContentsByType(
  userId: string, 
  contentType: string = 'sales_content'
): Promise<GeneratedContent[]> {
  const supabase = await createServerClient();
  
  const { data: contents, error } = await supabase
    .from('generated_contents')
    .select('*')
    .eq('user_id', userId)
    .eq('content_type', contentType)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching generated contents by type:', error);
    throw new Error('Failed to fetch generated contents');
  }

  return contents || [];
}

export async function deleteGeneratedContent(
  userId: string, 
  contentId: string
): Promise<void> {
  const supabase = await createServerClient();
  
  const { error } = await supabase
    .from('generated_contents')
    .delete()
    .eq('id', contentId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting generated content:', error);
    throw new Error('Failed to delete generated content');
  }
}