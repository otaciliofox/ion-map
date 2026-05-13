'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { useAuth } from '@/lib/hooks/use-auth'
import { ClientDashboard } from '@/components/painel/client-dashboard'
import { HeartPulse } from 'lucide-react'

export default function PainelPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) { router.replace('/auth/login'); return }
    if (profile?.role === 'admin') router.replace('/admin')
    else if (profile?.role === 'supervisor') router.replace('/supervisor')
  }, [user, profile, loading, router])

  if (loading || !user || !profile) return (
    <div className="min-h-screen flex items-center justify-center">
      <HeartPulse className="w-10 h-10 text-primary animate-heartbeat" />
    </div>
  )

  if (profile.role !== 'client') return null

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        <ClientDashboard profile={profile} />
      </main>
    </div>
  )
}
