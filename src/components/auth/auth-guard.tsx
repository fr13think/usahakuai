'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from './auth-provider'
import { LoginForm } from './login-form'
import { RegisterForm } from './register-form'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const [showRegister, setShowRegister] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const router = useRouter()

  // Double-check authentication state on mount
  useEffect(() => {
    if (!loading) {
      // Add a small delay to ensure auth state is fully resolved
      const timer = setTimeout(() => {
        setIsValidating(false)
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [loading])

  // Show loading spinner while checking auth
  if (loading || isValidating) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-muted-foreground">Memvalidasi sesi...</span>
      </div>
    )
  }

  // If user is authenticated, show the protected content
  if (user) {
    return <>{children}</>
  }

  // If not authenticated, show auth forms
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            UsahaKu Navigator
          </h1>
          <p className="text-sm text-muted-foreground">
            Platform AI untuk pengusaha Indonesia
          </p>
        </div>
        
        {showRegister ? (
          <RegisterForm
            onSuccess={() => {
              setShowRegister(false)
            }}
            onSwitchToLogin={() => setShowRegister(false)}
          />
        ) : (
          <LoginForm
            onSuccess={() => {
              router.push('/dashboard')
            }}
            onSwitchToRegister={() => setShowRegister(true)}
          />
        )}
      </div>
    </div>
  )
}