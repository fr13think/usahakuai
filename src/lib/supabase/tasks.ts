import { createServerClient } from './server'
import { Database } from './database.types'

type TaskInsert = Database['public']['Tables']['tasks']['Insert']
type TaskUpdate = Database['public']['Tables']['tasks']['Update']

export async function createTask(task: TaskInsert) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single()

  if (error) {
    throw new Error(`Error creating task: ${error.message}`)
  }

  return data
}

export async function getTasks(userId: string, filters?: {
  status?: string
  priority?: string
}) {
  const supabase = await createServerClient()
  
  let query = supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.priority) {
    query = query.eq('priority', filters.priority)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Error fetching tasks: ${error.message}`)
  }

  return data
}

export async function getTask(id: string, userId: string) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) {
    throw new Error(`Error fetching task: ${error.message}`)
  }

  return data
}

export async function updateTask(id: string, userId: string, updates: TaskUpdate) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Error updating task: ${error.message}`)
  }

  return data
}

export async function deleteTask(id: string, userId: string) {
  const supabase = await createServerClient()
  
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Error deleting task: ${error.message}`)
  }
}

export async function markTaskComplete(id: string, userId: string) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('tasks')
    .update({ 
      status: 'completed', 
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Error marking task as complete: ${error.message}`)
  }

  return data
}

export async function markTaskIncomplete(id: string, userId: string) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('tasks')
    .update({ 
      status: 'pending', 
      completed_at: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Error marking task as incomplete: ${error.message}`)
  }

  return data
}

// Helper functions untuk task statistics
export async function getTaskStatistics(userId: string) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('tasks')
    .select('status')
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Error fetching task statistics: ${error.message}`)
  }

  const stats = {
    total: data.length,
    pending: data.filter(task => task.status === 'pending').length,
    completed: data.filter(task => task.status === 'completed').length,
    in_progress: data.filter(task => task.status === 'in_progress').length,
  }

  return stats
}
