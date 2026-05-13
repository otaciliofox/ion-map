'use client'

import { Header } from '@/components/layout/header'
import { useAuth } from '@/lib/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { HeartPulse } from 'lucide-react'

export default function SupervisorPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) router.replace('/auth/login')
    else if (profile && profile.role === 'client') router.replace('/painel')
  }, [user, profile, loading, router])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><HeartPulse className="w-10 h-10 text-primary animate-heartbeat" /></div>

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16 max-w-6xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Painel do Supervisor</h1>
        <p className="text-muted-foreground mb-8">Fila de aprovação de estabelecimentos</p>
        <div className="rounded-xl border-2 border-dashed border-border p-12 text-center text-muted-foreground">
          🚧 Painel de aprovação — em desenvolvimento (Fase 5)
        </div>
      </main>
    </div>
  )
}
