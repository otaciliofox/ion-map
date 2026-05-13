'use client'

import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/layout/header'
import { useAuth } from '@/lib/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Profile, Establishment } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  HeartPulse, Users, Building2, CheckCircle2, Clock, XCircle, Loader2, RefreshCw,
} from 'lucide-react'

type Role = 'client' | 'supervisor' | 'admin'
type EstStatus = 'active' | 'pending' | 'inactive'

const ROLE_CFG: Record<Role, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' }> = {
  admin: { label: 'Admin', variant: 'destructive' },
  supervisor: { label: 'Supervisor', variant: 'warning' },
  client: { label: 'Cliente', variant: 'default' },
}
const STATUS_CFG: Record<EstStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' }> = {
  active: { label: 'Ativo', variant: 'success' },
  pending: { label: 'Pendente', variant: 'warning' },
  inactive: { label: 'Inativo', variant: 'destructive' },
}

export default function AdminPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [establishments, setEstablishments] = useState<Establishment[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [tab, setTab] = useState<'users' | 'establishments'>('users')

  useEffect(() => {
    if (loading) return
    if (!user) router.replace('/auth/login')
    else if (profile && profile.role !== 'admin') router.replace('/painel')
  }, [user, profile, loading, router])

  const loadData = useCallback(async () => {
    setDataLoading(true)
    const supabase = createClient()
    const [pRes, eRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('establishments').select('*').order('created_at', { ascending: false }),
    ])
    if (pRes.data) setProfiles(pRes.data as Profile[])
    if (eRes.data) setEstablishments(eRes.data as Establishment[])
    setDataLoading(false)
  }, [])

  useEffect(() => {
    if (!loading && user && profile?.role === 'admin') loadData()
  }, [loading, user, profile, loadData])

  async function changeRole(profileId: string, newRole: Role) {
    setUpdatingId(profileId)
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', profileId)
    if (!error) setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, role: newRole } : p))
    setUpdatingId(null)
  }

  async function changeStatus(estId: string, newStatus: EstStatus) {
    setUpdatingId(estId)
    const supabase = createClient()
    const now = new Date().toISOString()
    const updateData = newStatus === 'active'
      ? { status: newStatus, approved_at: now, approved_by: user?.id ?? null }
      : { status: newStatus }
    const { error } = await supabase.from('establishments').update(updateData).eq('id', estId)
    if (!error) {
      setEstablishments(prev => prev.map(e =>
        e.id === estId ? { ...e, status: newStatus, ...(newStatus === 'active' ? { approved_at: now, approved_by: user?.id ?? null } : {}) } : e
      ))
    }
    setUpdatingId(null)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <HeartPulse className="w-10 h-10 text-primary animate-heartbeat" />
    </div>
  )
  if (!profile || profile.role !== 'admin') return null

  const stats = {
    totalUsers: profiles.length,
    active: establishments.filter(e => e.status === 'active').length,
    pending: establishments.filter(e => e.status === 'pending').length,
    inactive: establishments.filter(e => e.status === 'inactive').length,
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16 max-w-7xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Painel Administrativo</h1>
            <p className="text-muted-foreground mt-1">Gerenciamento completo da plataforma</p>
          </div>
          <Button variant="outline" onClick={loadData} disabled={dataLoading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`} />Atualizar
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, color: 'text-primary', val: stats.totalUsers, label: 'Usuarios' },
            { icon: CheckCircle2, color: 'text-green-500', val: stats.active, label: 'Ativos' },
            { icon: Clock, color: 'text-yellow-500', val: stats.pending, label: 'Pendentes' },
            { icon: XCircle, color: 'text-destructive', val: stats.inactive, label: 'Inativos' },
          ].map(({ icon: Icon, color, val, label }) => (
            <Card key={label}>
              <CardContent className="pt-6 text-center">
                <Icon className={`w-6 h-6 mx-auto mb-2 ${color}`} />
                <p className="text-3xl font-bold">{val}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex border-b border-border mb-6">
          {([
            { id: 'users', icon: Users, label: `Usuarios (${profiles.length})` },
            { id: 'establishments', icon: Building2, label: `Estabelecimentos (${establishments.length})` },
          ] as const).map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-2 ${
                tab === id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {dataLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tab === 'users' ? (
          <Card>
            <CardHeader><CardTitle>Gerenciar Usuarios</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Nome</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Funcao</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Membro desde</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map(p => {
                      const { label, variant } = ROLE_CFG[p.role]
                      const isUpd = updatingId === p.id
                      return (
                        <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium">{p.name ?? 'Sem nome'}</p>
                            <p className="text-xs text-muted-foreground">{p.id.slice(0, 8)}...</p>
                          </td>
                          <td className="px-4 py-3"><Badge variant={variant}>{label}</Badge></td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {new Date(p.created_at).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2 flex-wrap">
                              {(['client', 'supervisor', 'admin'] as Role[]).filter(r => r !== p.role).map(role => (
                                <Button key={role} variant="outline" size="sm" onClick={() => changeRole(p.id, role)}
                                  disabled={isUpd} className="text-xs">
                                  {isUpd ? <Loader2 className="w-3 h-3 animate-spin" /> : ROLE_CFG[role].label}
                                </Button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader><CardTitle>Gerenciar Estabelecimentos</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Estabelecimento</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Localizacao</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Status</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Cadastrado</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {establishments.map(est => {
                      const { label, variant } = STATUS_CFG[est.status]
                      const isUpd = updatingId === est.id
                      return (
                        <tr key={est.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium">{est.name}</p>
                            <p className="text-xs text-muted-foreground">{est.id.slice(0, 8)}...</p>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {est.city ? `${est.city}, ${est.state}` : est.address}
                          </td>
                          <td className="px-4 py-3"><Badge variant={variant}>{label}</Badge></td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {new Date(est.created_at).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2 flex-wrap">
                              {(['active', 'pending', 'inactive'] as EstStatus[]).filter(s => s !== est.status).map(s => (
                                <Button key={s} variant="outline" size="sm" onClick={() => changeStatus(est.id, s)}
                                  disabled={isUpd} className="text-xs">
                                  {isUpd ? <Loader2 className="w-3 h-3 animate-spin" /> : STATUS_CFG[s].label}
                                </Button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
