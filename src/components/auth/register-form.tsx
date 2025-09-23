'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from './auth-provider'

const registerSchema = z.object({
  fullName: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password tidak sama',
  path: ['confirmPassword'],
})

type RegisterFormValues = z.infer<typeof registerSchema>

interface RegisterFormProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { signUp } = useAuth()
  const { toast } = useToast()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(values: RegisterFormValues) {
    setIsLoading(true)
    try {
      const { error } = await signUp(values.email, values.password, values.fullName)

      if (error) {
        console.error('Registration error:', error)
        
        let errorMessage = 'Terjadi kesalahan saat mendaftar'
        
        // Handle specific error types
        if (error.message?.includes('User already registered')) {
          errorMessage = 'Email sudah terdaftar. Silakan gunakan email lain atau masuk dengan akun yang ada.'
        } else if (error.message?.includes('Invalid email')) {
          errorMessage = 'Format email tidak valid. Silakan periksa kembali email Anda.'
        } else if (error.message?.includes('Password')) {
          errorMessage = 'Password terlalu lemah. Gunakan minimal 6 karakter.'
        } else if (error.message?.includes('Database')) {
          errorMessage = 'Gagal menyimpan data pengguna. Silakan coba lagi dalam beberapa saat.'
        } else if (error.message) {
          errorMessage = error.message
        }
        
        toast({
          variant: 'destructive',
          title: 'Pendaftaran Gagal',
          description: errorMessage,
        })
        return
      }

      toast({
        title: 'Pendaftaran Berhasil',
        description: 'Silakan cek email Anda untuk verifikasi akun.',
      })

      onSuccess?.()
    } catch (error) {
      console.error('Unexpected registration error:', error)
      toast({
        variant: 'destructive',
        title: 'Pendaftaran Gagal',
        description: 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Daftar</CardTitle>
        <CardDescription className="text-center">
          Buat akun baru untuk mulai menggunakan UsahaKu AI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Masukkan nama lengkap"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="nama@example.com"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Buat password"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Konfirmasi Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Ulangi password"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Daftar
            </Button>
          </form>
        </Form>
        {onSwitchToLogin && (
          <div className="mt-4 text-center text-sm">
            Sudah punya akun?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-primary hover:underline font-medium"
              disabled={isLoading}
            >
              Masuk di sini
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}