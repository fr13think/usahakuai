'use client'

import Link from 'next/link'
import { ArrowLeft, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RegisterForm } from '@/components/auth/register-form'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import { useEffect } from 'react'

export default function RegisterPage() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  const handleRegisterSuccess = () => {
    router.push('/dashboard')
  }

  const handleSwitchToLogin = () => {
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft size={20} />
              Kembali ke Beranda
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Brain className="text-primary" size={32} />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              UsahaKu AI
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <RegisterForm 
          onSuccess={handleRegisterSuccess}
          onSwitchToLogin={handleSwitchToLogin}
        />
      </div>
    </div>
  )
}