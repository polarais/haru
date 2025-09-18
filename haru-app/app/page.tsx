'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { GradientBackground } from '@/components/ui/gradient-background'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  return (
    <GradientBackground className="min-h-screen flex items-center justify-center">
      <LoadingSpinner variant="spinner" text="Redirecting..." />
    </GradientBackground>
  )
}
