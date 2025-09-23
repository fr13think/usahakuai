import { createServerClient } from './server'
import { Database } from './database.types'

type DocumentAnalysis = Database['public']['Tables']['document_analyses']['Row']
type DocumentAnalysisInsert = Database['public']['Tables']['document_analyses']['Insert']

export async function createDocumentAnalysis(analysis: DocumentAnalysisInsert) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('document_analyses')
    .insert(analysis)
    .select()
    .single()

  if (error) {
    throw new Error(`Error creating document analysis: ${error.message}`)
  }

  return data
}

export async function getDocumentAnalyses(userId: string) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('document_analyses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Error fetching document analyses: ${error.message}`)
  }

  return data
}

export async function getDocumentAnalysis(id: string, userId: string) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('document_analyses')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) {
    throw new Error(`Error fetching document analysis: ${error.message}`)
  }

  return data
}

export async function deleteDocumentAnalysis(id: string, userId: string) {
  const supabase = await createServerClient()
  
  const { error } = await supabase
    .from('document_analyses')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Error deleting document analysis: ${error.message}`)
  }
}

// Helper function untuk format hasil document analysis
export function formatDocumentAnalysisResult(analysis: DocumentAnalysis) {
  return {
    id: analysis.id,
    fileName: analysis.file_name,
    fileSize: analysis.file_size,
    fileType: analysis.file_type,
    summary: analysis.summary,
    keyPoints: Array.isArray(analysis.key_points) ? analysis.key_points as string[] : [],
    recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations as string[] : [],
    createdAt: analysis.created_at
  }
}
