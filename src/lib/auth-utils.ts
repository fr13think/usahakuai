/**
 * Utility functions for authentication management
 */

export const clearAuthStorage = () => {
  if (typeof window === 'undefined') return

  try {
    // Clear all Supabase-related localStorage items
    const localKeys = Object.keys(localStorage)
    localKeys.forEach(key => {
      if (key.startsWith('sb-') || key.includes('supabase') || key.includes('auth')) {
        localStorage.removeItem(key)
        console.log(`Removed localStorage key: ${key}`)
      }
    })

    // Clear all Supabase-related sessionStorage items
    const sessionKeys = Object.keys(sessionStorage)
    sessionKeys.forEach(key => {
      if (key.startsWith('sb-') || key.includes('supabase') || key.includes('auth')) {
        sessionStorage.removeItem(key)
        console.log(`Removed sessionStorage key: ${key}`)
      }
    })

    // Clear cookies by setting them to expire
    const cookiesToClear = [
      'sb-access-token',
      'sb-refresh-token',
      'supabase-auth-token',
      'supabase.auth.token'
    ]

    cookiesToClear.forEach(cookieName => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`
    })

    console.log('Auth storage cleared successfully')
  } catch (error) {
    console.error('Error clearing auth storage:', error)
  }
}

export const forceLogout = () => {
  clearAuthStorage()
  
  // Force redirect with cache invalidation
  if (typeof window !== 'undefined') {
    // Add timestamp to prevent caching
    const redirectUrl = `/?t=${Date.now()}&logout=true`
    window.location.replace(redirectUrl)
  }
}

export const isAuthPath = (pathname: string): boolean => {
  return pathname === '/' || pathname.startsWith('/auth')
}

export const isDashboardPath = (pathname: string): boolean => {
  return pathname.startsWith('/dashboard')
}

import { SupabaseClient } from '@supabase/supabase-js'

export const validateSession = async (supabase: SupabaseClient) => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Session validation error:', error)
      return false
    }
    
    if (!session) {
      console.log('No active session found')
      return false
    }
    
    // Check if token is expired
    const now = Date.now() / 1000
    if (session.expires_at && session.expires_at < now) {
      console.log('Session expired')
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error validating session:', error)
    return false
  }
}