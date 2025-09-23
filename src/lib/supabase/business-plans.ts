import { createServerClient } from './server'
import { Database } from './database.types'

type BusinessPlanInsert = Database['public']['Tables']['business_plans']['Insert']
type BusinessPlanUpdate = Database['public']['Tables']['business_plans']['Update']

export async function createBusinessPlan(businessPlan: BusinessPlanInsert) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('business_plans')
    .insert(businessPlan)
    .select()
    .single()

  if (error) {
    throw new Error(`Error creating business plan: ${error.message}`)
  }

  return data
}

export async function getBusinessPlans(userId: string) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('business_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Error fetching business plans: ${error.message}`)
  }

  return data
}

export async function getBusinessPlan(id: string, userId: string) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('business_plans')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) {
    throw new Error(`Error fetching business plan: ${error.message}`)
  }

  return data
}

export async function updateBusinessPlan(id: string, userId: string, updates: BusinessPlanUpdate) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('business_plans')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Error updating business plan: ${error.message}`)
  }

  return data
}

export async function deleteBusinessPlan(id: string, userId: string) {
  const supabase = await createServerClient()
  
  const { error } = await supabase
    .from('business_plans')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Error deleting business plan: ${error.message}`)
  }
}