import { createServerClient } from './server'
import { Database } from './database.types'

type FinancialInsightInsert = Database['public']['Tables']['financial_insights']['Insert']
type FinancialInsightUpdate = Database['public']['Tables']['financial_insights']['Update']

export async function createFinancialInsight(insight: FinancialInsightInsert) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('financial_insights')
    .insert(insight)
    .select()
    .single()

  if (error) {
    throw new Error(`Error creating financial insight: ${error.message}`)
  }

  return data
}

export async function getFinancialInsights(userId: string) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('financial_insights')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Error fetching financial insights: ${error.message}`)
  }

  return data
}

export async function getFinancialInsight(id: string, userId: string) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('financial_insights')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) {
    throw new Error(`Error fetching financial insight: ${error.message}`)
  }

  return data
}

export async function updateFinancialInsight(id: string, userId: string, updates: FinancialInsightUpdate) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('financial_insights')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Error updating financial insight: ${error.message}`)
  }

  return data
}

export async function deleteFinancialInsight(id: string, userId: string) {
  const supabase = await createServerClient()
  
  const { error } = await supabase
    .from('financial_insights')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Error deleting financial insight: ${error.message}`)
  }
}
