import { createServerClient } from './server'
import { Json } from './database.types'

export interface FinancialAnalysis {
  id: string
  user_id: string
  file_name: string
  file_size: number | null
  file_type: string | null
  transactions: Transaction[]
  summary: FinancialSummary
  insights: string[]
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
}

export interface FinancialSummary {
  totalIncome: number
  totalExpense: number
  netProfit: number
  transactionCount: number
}

export interface FinancialAnalysisInsert {
  user_id: string
  file_name: string
  file_size?: number | null
  file_type?: string | null
  transactions: Transaction[]
  summary: FinancialSummary
  insights: string[]
}

export interface FinancialAnalysisDBInsert {
  user_id: string
  file_name: string
  file_size?: number | null
  file_type?: string | null
  transactions: Json
  summary: Json
  insights: Json
}

export interface FinancialAnalysisUpdate {
  file_name?: string
  file_size?: number | null
  file_type?: string | null
  transactions?: Transaction[]
  summary?: FinancialSummary
  insights?: string[]
}

export interface FinancialAnalysisDBUpdate {
  file_name?: string
  file_size?: number | null
  file_type?: string | null
  transactions?: Json
  summary?: Json
  insights?: Json
}

// Create a new financial analysis
export async function createFinancialAnalysis(analysis: FinancialAnalysisInsert) {
  const supabase = await createServerClient()
  
  const dbAnalysis: FinancialAnalysisDBInsert = {
    ...analysis,
    transactions: analysis.transactions as unknown as Json,
    summary: analysis.summary as unknown as Json,
    insights: analysis.insights as unknown as Json,
  }
  
  const { data, error } = await supabase
.from('financial_analyses')
    .insert({
      ...dbAnalysis,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Error creating financial analysis: ${error.message}`)
  }

  return data as unknown as FinancialAnalysis
}

// Get all financial analyses for a user
export async function getFinancialAnalyses(userId: string): Promise<FinancialAnalysis[]> {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
.from('financial_analyses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Error fetching financial analyses: ${error.message}`)
  }

  return (data || []) as unknown as FinancialAnalysis[]
}

// Get a specific financial analysis
export async function getFinancialAnalysis(
  id: string, 
  userId: string
): Promise<FinancialAnalysis | null> {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
.from('financial_analyses')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Record not found
    }
    throw new Error(`Error fetching financial analysis: ${error.message}`)
  }

  return data as unknown as FinancialAnalysis
}

// Update a financial analysis
export async function updateFinancialAnalysis(
  id: string,
  userId: string,
  updates: FinancialAnalysisUpdate
) {
  const supabase = await createServerClient()
  
  const dbUpdates: FinancialAnalysisDBUpdate = {
    ...updates,
    transactions: updates.transactions ? (updates.transactions as unknown as Json) : undefined,
    summary: updates.summary ? (updates.summary as unknown as Json) : undefined,
    insights: updates.insights ? (updates.insights as unknown as Json) : undefined,
  }
  
  const { data, error } = await supabase
.from('financial_analyses')
    .update({
      ...dbUpdates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Error updating financial analysis: ${error.message}`)
  }

  return data as unknown as FinancialAnalysis
}

// Delete a financial analysis
export async function deleteFinancialAnalysis(id: string, userId: string) {
  const supabase = await createServerClient()
  
  const { error } = await supabase
.from('financial_analyses')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Error deleting financial analysis: ${error.message}`)
  }
}

// Get summary statistics for user's financial analyses
export async function getFinancialAnalysesSummary(userId: string) {
  const analyses = await getFinancialAnalyses(userId)
  
  const totalAnalyses = analyses.length
  const totalTransactions = analyses.reduce((sum, analysis) => 
    sum + (analysis.summary?.transactionCount || 0), 0
  )
  const totalIncome = analyses.reduce((sum, analysis) => 
    sum + (analysis.summary?.totalIncome || 0), 0
  )
  const totalExpenses = analyses.reduce((sum, analysis) => 
    sum + (analysis.summary?.totalExpense || 0), 0
  )
  
  return {
    totalAnalyses,
    totalTransactions,
    totalIncome,
    totalExpenses,
    netProfit: totalIncome - totalExpenses,
    lastAnalysis: analyses[0]?.created_at || null
  }
}