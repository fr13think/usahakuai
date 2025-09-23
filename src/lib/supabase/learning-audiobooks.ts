'use server';

import { createServerClient as createClient } from './server';
import { Database } from './database.types';

type AudiobookRow = Database['public']['Tables']['learning_audiobooks']['Row'];
type AudiobookInsert = Database['public']['Tables']['learning_audiobooks']['Insert'];
type AudiobookUpdate = Database['public']['Tables']['learning_audiobooks']['Update'];

export async function getAudiobooksByUserId(userId: string): Promise<AudiobookRow[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('learning_audiobooks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching audiobooks:', error);
    throw new Error(`Failed to fetch audiobooks: ${error.message}`);
  }

  return data || [];
}

export async function getAudiobookById(id: string): Promise<AudiobookRow | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('learning_audiobooks')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No rows found
    }
    console.error('Error fetching audiobook:', error);
    throw new Error(`Failed to fetch audiobook: ${error.message}`);
  }

  return data;
}

export async function createAudiobook(audiobook: AudiobookInsert): Promise<AudiobookRow> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('learning_audiobooks')
    .insert(audiobook)
    .select()
    .single();

  if (error) {
    console.error('Error creating audiobook:', error);
    throw new Error(`Failed to create audiobook: ${error.message}`);
  }

  return data;
}

export async function updateAudiobook(id: string, updates: AudiobookUpdate): Promise<AudiobookRow> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('learning_audiobooks')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating audiobook:', error);
    throw new Error(`Failed to update audiobook: ${error.message}`);
  }

  return data;
}

export async function deleteAudiobook(id: string): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('learning_audiobooks')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting audiobook:', error);
    throw new Error(`Failed to delete audiobook: ${error.message}`);
  }
}

export async function updatePlayCount(id: string): Promise<void> {
  const supabase = await createClient();
  
  // Get current play count
  const { data: current } = await supabase
    .from('learning_audiobooks')
    .select('play_count')
    .eq('id', id)
    .single();

  if (current) {
    await supabase
      .from('learning_audiobooks')
      .update({
        play_count: (current.play_count || 0) + 1,
        last_played_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
  }
}
