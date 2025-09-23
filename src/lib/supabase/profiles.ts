import { createServerClient } from './server'
import { Database } from './database.types'

type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export async function getProfile(userId: string) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    throw new Error(`Error fetching profile: ${error.message}`)
  }

  return data
}

export async function updateProfile(userId: string, updates: ProfileUpdate) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Error updating profile: ${error.message}`)
  }

  return data
}

export async function createProfile(profile: ProfileInsert) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single()

  if (error) {
    throw new Error(`Error creating profile: ${error.message}`)
  }

  return data
}

// Helper function untuk check apakah profile sudah ada
export async function checkProfileExists(userId: string): Promise<boolean> {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Error checking profile existence: ${error.message}`)
  }

  return !!data
}

// Helper function untuk get or create profile
export async function getOrCreateProfile(userId: string, email: string, fullName?: string) {
  try {
    // Try to get existing profile
    return await getProfile(userId)
  } catch {
    // If profile doesn't exist, create it
    return await createProfile({
      id: userId,
      email,
      full_name: fullName || null
    })
  }
}
