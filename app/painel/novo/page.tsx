'use client'

import { Header } from '@/components/layout/header'
import { useAuth } from '@/lib/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { HeartPulse } from 'lucide-react'

export default function NovoEstabelecimentoPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.replace('/auth/login')
  }, [user, loading, router])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><HeartPulse className="w-10 h-10 text-primary animate-heartbeat" /></div>

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16 max-w-2xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Cadastrar Estabelecimento</h1>
        <p className="text-muted-foreground mb-8">Formulário completo em implementação — Fase 3</p>
        <div className="rounded-xl border-2 border-dashed border-border p-12 text-center text-muted-foreground">
          🚧 Formulário com upload de fotos — em desenvolvimento
        </div>
      </main>
    </div>
  )
}
