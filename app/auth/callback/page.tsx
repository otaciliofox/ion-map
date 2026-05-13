'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { HeartPulse } from 'lucide-react'
import { createClient } from '@/lib/supabase'

export default function CallbackPage() {
  const router = useRouter()

  useEffect(() => {
    async function redirect() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/'); return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role === 'admin') router.replace('/admin')
      else if (profile?.role === 'supervisor') router.replace('/supervisor')
      else router.replace('/painel')
    }
    redirect()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
      <div className="text-center space-y-4">
        <HeartPulse className="w-12 h-12 text-primary mx-auto animate-heartbeat" />
        <p className="text-muted-foreground">Autenticando...</p>
      </div>
    </div>
  )
}
