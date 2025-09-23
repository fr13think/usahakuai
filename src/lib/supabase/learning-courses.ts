'use server';

import { createServerClient as createClient } from './server';
import { Database } from './database.types';

type CourseRow = Database['public']['Tables']['learning_courses']['Row'];
type CourseInsert = Database['public']['Tables']['learning_courses']['Insert'];
type CourseUpdate = Database['public']['Tables']['learning_courses']['Update'];

export async function getCoursesByUserId(userId: string): Promise<CourseRow[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('learning_courses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching courses:', error);
    throw new Error(`Failed to fetch courses: ${error.message}`);
  }

  return data || [];
}

export async function getCourseById(id: string): Promise<CourseRow | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('learning_courses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No rows found
    }
    console.error('Error fetching course:', error);
    throw new Error(`Failed to fetch course: ${error.message}`);
  }

  return data;
}

export async function createCourse(course: CourseInsert): Promise<CourseRow> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('learning_courses')
    .insert(course)
    .select()
    .single();

  if (error) {
    console.error('Error creating course:', error);
    throw new Error(`Failed to create course: ${error.message}`);
  }

  return data;
}

export async function updateCourse(id: string, updates: CourseUpdate): Promise<CourseRow> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('learning_courses')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating course:', error);
    throw new Error(`Failed to update course: ${error.message}`);
  }

  return data;
}

export async function deleteCourse(id: string): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('learning_courses')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting course:', error);
    throw new Error(`Failed to delete course: ${error.message}`);
  }
}

export async function updateCourseProgress(id: string, progressPercentage: number): Promise<void> {
  const supabase = await createClient();
  
  const updates: CourseUpdate = {
    progress_percentage: Math.min(Math.max(progressPercentage, 0), 100),
    updated_at: new Date().toISOString()
  };

  // Mark as completed if progress reaches 100%
  if (progressPercentage >= 100) {
    updates.is_completed = true;
    updates.completion_date = new Date().toISOString();
  }

  const { error } = await supabase
    .from('learning_courses')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating course progress:', error);
    throw new Error(`Failed to update course progress: ${error.message}`);
  }
}