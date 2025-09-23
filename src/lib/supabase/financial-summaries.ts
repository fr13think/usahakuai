import { createServerClient } from './server'
import { Json } from './database.types'
import crypto from 'crypto'

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

export interface FinancialSummaryRow {
  id: string
  user_id: string
  file_name: string
  file_size: number | null
  file_type: string | null
  file_hash: string | null
  transactions: Transaction[]
  summary: FinancialSummary
  insights: string[]
  is_duplicate: boolean | null
  original_analysis_id: string | null
  created_at: string
  updated_at: string
}

export interface FinancialSummaryInsert {
  user_id: string
  file_name: string
  file_size?: number | null
  file_type?: string | null
  file_hash?: string | null
  transactions: Transaction[]
  summary: FinancialSummary
  insights: string[]
  is_duplicate?: boolean | null
  original_analysis_id?: string | null
}

export interface FinancialSummaryUpdate {
  file_name?: string
  file_size?: number | null
  file_type?: string | null
  file_hash?: string | null
  transactions?: Transaction[]
  summary?: FinancialSummary
  insights?: string[]
  is_duplicate?: boolean | null
  original_analysis_id?: string | null
}

// Generate file hash for duplicate detection
export function generateFileHash(fileName: string, fileSize: number, content?: string): string {
  const hashInput = `${fileName}_${fileSize}_${content || ''}`
  return crypto.createHash('md5').update(hashInput).digest('hex')
}

// Check for existing analysis with same file hash
export async function checkForDuplicate(userId: string, fileHash: string): Promise<FinancialSummaryRow | null> {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('financial_summaries')
    .select('*')
    .eq('user_id', userId)
    .eq('file_hash', fileHash)
    .eq('is_duplicate', false) // Only get original, not duplicates
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Error checking for duplicate: ${error.message}`)
  }

  return data as unknown as FinancialSummaryRow | null
}

// Create a new financial summary with duplicate detection
export async function createFinancialSummary(analysis: FinancialSummaryInsert, fileContent?: string): Promise<{
  data: FinancialSummaryRow
  isDuplicate: boolean
  originalAnalysis?: FinancialSummaryRow
}> {
  const supabase = await createServerClient()
  
  // Generate file hash
  const fileHash = generateFileHash(
    analysis.file_name, 
    analysis.file_size || 0, 
    fileContent
  )
  
  // Check for existing analysis
  const existingAnalysis = await checkForDuplicate(analysis.user_id, fileHash)
  
  const dbAnalysis = {
    ...analysis,
    file_hash: fileHash,
    transactions: analysis.transactions as unknown as Json,
    summary: analysis.summary as unknown as Json,
    insights: analysis.insights as unknown as Json,
    is_duplicate: existingAnalysis ? true : false,
    original_analysis_id: existingAnalysis ? existingAnalysis.id : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  const { data, error } = await supabase
    .from('financial_summaries')
    .insert(dbAnalysis)
    .select()
    .single()

  if (error) {
    throw new Error(`Error creating financial summary: ${error.message}`)
  }

  return {
    data: data as unknown as FinancialSummaryRow,
    isDuplicate: !!existingAnalysis,
    originalAnalysis: existingAnalysis || undefined
  }
}

// Get all financial summaries for a user (non-duplicates only by default)
export async function getFinancialSummaries(
  userId: string, 
  includeDuplicates: boolean = false
): Promise<FinancialSummaryRow[]> {
  const supabase = await createServerClient()
  
  let query = supabase
    .from('financial_summaries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (!includeDuplicates) {
    query = query.eq('is_duplicate', false)
  }
  
  const { data, error } = await query

  if (error) {
    throw new Error(`Error fetching financial summaries: ${error.message}`)
  }

  return (data || []) as unknown as FinancialSummaryRow[]
}

// Get a specific financial summary
export async function getFinancialSummary(
  id: string, 
  userId: string
): Promise<FinancialSummaryRow | null> {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('financial_summaries')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Record not found
    }
    throw new Error(`Error fetching financial summary: ${error.message}`)
  }

  return data as unknown as FinancialSummaryRow
}

// Update a financial summary
export async function updateFinancialSummary(
  id: string,
  userId: string,
  updates: FinancialSummaryUpdate
): Promise<FinancialSummaryRow> {
  const supabase = await createServerClient()
  
  const dbUpdates = {
    ...updates,
    transactions: updates.transactions ? (updates.transactions as unknown as Json) : undefined,
    summary: updates.summary ? (updates.summary as unknown as Json) : undefined,
    insights: updates.insights ? (updates.insights as unknown as Json) : undefined,
    updated_at: new Date().toISOString()
  }
  
  const { data, error } = await supabase
    .from('financial_summaries')
    .update(dbUpdates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Error updating financial summary: ${error.message}`)
  }

  return data as unknown as FinancialSummaryRow
}

// Delete a financial summary
export async function deleteFinancialSummary(id: string, userId: string): Promise<void> {
  const supabase = await createServerClient()
  
  const { error } = await supabase
    .from('financial_summaries')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Error deleting financial summary: ${error.message}`)
  }
}

// Get aggregated chart data for dashboard
export async function getFinancialSummaryChartData(userId: string): Promise<{
  chartData: Array<{
    month: string
    revenue: number
    expenses: number
  }>
  totalSummaries: number
  lastUpdated: string | null
}> {
  const summaries = await getFinancialSummaries(userId, false)
  
  if (summaries.length === 0) {
    return {
      chartData: [],
      totalSummaries: 0,
      lastUpdated: null
    }
  }

  // Group transactions by month
  const monthlyData: { [key: string]: { revenue: number, expenses: number, count: number } } = {}

  summaries.forEach(summary => {
    if (summary.transactions && Array.isArray(summary.transactions)) {
      summary.transactions.forEach((transaction: Transaction) => {
        if (transaction.date && transaction.amount) {
          const date = new Date(transaction.date)
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { revenue: 0, expenses: 0, count: 0 }
          }

          if (transaction.type === 'income') {
            monthlyData[monthKey].revenue += Math.abs(transaction.amount)
          } else {
            monthlyData[monthKey].expenses += Math.abs(transaction.amount)
          }
          monthlyData[monthKey].count++
        }
      })
    }
  })

  // Convert to chart format and get last 6 months
  const sortedMonths = Object.keys(monthlyData).sort().slice(-6)
  
  const chartData = sortedMonths.map(monthKey => {
    const date = new Date(monthKey + '-01')
    const monthName = date.toLocaleDateString('id-ID', { month: 'long' })
    
    return {
      month: monthName,
      revenue: Math.round(monthlyData[monthKey].revenue / 1000), // Convert to thousands
      expenses: Math.round(monthlyData[monthKey].expenses / 1000)
    }
  })

  return {
    chartData,
    totalSummaries: summaries.length,
    lastUpdated: summaries[0]?.created_at || null
  }
}

// Get summary statistics
export async function getFinancialSummaryStats(userId: string): Promise<{
  totalSummaries: number
  totalTransactions: number
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  duplicateCount: number
  lastAnalysis: string | null
}> {
  const allSummaries = await getFinancialSummaries(userId, true) // Include duplicates for stats
  const uniqueSummaries = allSummaries.filter(s => !s.is_duplicate)
  const duplicates = allSummaries.filter(s => s.is_duplicate)
  
  let totalTransactions = 0
  let totalRevenue = 0
  let totalExpenses = 0

  uniqueSummaries.forEach(summary => {
    if (summary.summary) {
      totalTransactions += summary.summary.transactionCount || 0
      totalRevenue += summary.summary.totalIncome || 0
      totalExpenses += summary.summary.totalExpense || 0
    }
  })

  return {
    totalSummaries: uniqueSummaries.length,
    totalTransactions,
    totalRevenue,
    totalExpenses,
    netProfit: totalRevenue - totalExpenses,
    duplicateCount: duplicates.length,
    lastAnalysis: uniqueSummaries[0]?.created_at || null
  }
}