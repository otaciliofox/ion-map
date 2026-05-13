'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { Establishment, EstablishmentPhoto } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2, XCircle, Clock, MapPin, Calendar, User, ZoomIn, Loader2, AlertCircle, AlertTriangle,
} from 'lucide-react'

interface EstWithProfile extends Omit<Establishment, 'establishment_photos'> {
  establishment_photos: EstablishmentPhoto[]
}
interface Stats { pending: number; rejected: number; totalActive: number }

export function ApprovalPanel({ supervisorId }: { supervisorId: string }) {
  const [activeTab, setActiveTab] = useState<'pending' | 'rejected'>('pending')
  const [pendingItems, setPendingItems] = useState<EstWithProfile[]>([])
  const [rejectedItems, setRejectedItems] = useState<EstWithProfile[]>([])
  const [stats, setStats] = useState<Stats>({ pending: 0, rejected: 0, totalActive: 0 })
  const [loading, setLoading] = useState(true)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectError, setRejectError] = useState('')
  const [actionId, setActionId] = useState<string | null>(null)
  const [enlarged, setEnlarged] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [pendingRes, rejectedRes, allRes] = await Promise.all([
        supabase.from('establishments').select('*, establishment_photos(*)')
          .eq('status', 'pending').order('created_at', { ascending: true }),
        supabase.from('establishments').select('*, establishment_photos(*)')
          .eq('status', 'inactive').order('created_at', { ascending: false }),
        supabase.from('establishments').select('status'),
      ])
      if (pendingRes.data) setPendingItems(pendingRes.data as EstWithProfile[])
      if (rejectedRes.data) setRejectedItems(rejectedRes.data as EstWithProfile[])
      if (allRes.data) {
        const all = allRes.data as { status: string }[]
        setStats({
          pending: all.filter(e => e.status === 'pending').length,
          rejected: all.filter(e => e.status === 'inactive').length,
          totalActive: all.filter(e => e.status === 'active').length,
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  async function approve(est: EstWithProfile) {
    setActionId(est.id)
    const supabase = createClient()
    const now = new Date().toISOString()
    const { error } = await supabase.from('establishments')
      .update({ status: 'active', approved_by: supervisorId, approved_at: now }).eq('id', est.id)
    if (!error) {
      await supabase.from('approval_logs').insert({
        establishment_id: est.id, actor_id: supervisorId, action: 'approved', comment: null,
      })
      setPendingItems(p => p.filter(e => e.id !== est.id))
      setStats(p => ({ ...p, pending: p.pending - 1, totalActive: p.totalActive + 1 }))
    }
    setActionId(null)
  }

  async function reject(est: EstWithProfile) {
    if (!rejectReason.trim()) { setRejectError('Motivo obrigatorio.'); return }
    setActionId(est.id)
    const supabase = createClient()
    const { error } = await supabase.from('establishments')
      .update({ status: 'inactive', rejection_reason: rejectReason }).eq('id', est.id)
    if (!error) {
      await supabase.from('approval_logs').insert({
        establishment_id: est.id, actor_id: supervisorId, action: 'rejected', comment: rejectReason,
      })
      const rejectedEst: EstWithProfile = { ...est, status: 'inactive', rejection_reason: rejectReason }
      setPendingItems(p => p.filter(e => e.id !== est.id))
      setRejectedItems(p => [rejectedEst, ...p])
      setStats(p => ({ ...p, pending: p.pending - 1, rejected: p.rejected + 1 }))
      setRejectingId(null); setRejectReason(''); setRejectError('')
    }
    setActionId(null)
  }

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const items = activeTab === 'pending' ? pendingItems : rejectedItems

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Clock, color: 'text-yellow-500', val: stats.pending, label: 'Pendentes' },
          { icon: XCircle, color: 'text-destructive', val: stats.rejected, label: 'Rejeitados' },
          { icon: MapPin, color: 'text-primary', val: stats.totalActive, label: 'Total Ativos' },
        ].map(({ icon: Icon, color, val, label }) => (
          <Card key={label}>
            <div className="pt-6 pb-4 text-center">
              <Icon className={`w-6 h-6 mx-auto mb-2 ${color}`} />
              <p className="text-3xl font-bold text-foreground">{val}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {([
          { id: 'pending' as const, label: `Pendentes (${pendingItems.length})` },
          { id: 'rejected' as const, label: `Rejeitados (${rejectedItems.length})` },
        ]).map(({ id, label }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            <p className="text-lg font-semibold">
              {activeTab === 'pending' ? 'Fila vazia!' : 'Nenhum rejeitado!'}
            </p>
            <p className="text-muted-foreground text-sm">
              {activeTab === 'pending'
                ? 'Nenhum estabelecimento aguardando aprovacao.'
                : 'Nenhum estabelecimento rejeitado no momento.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map(est => {
            const placePhoto = est.establishment_photos?.find(p => p.photo_type === 'place')
            const equipPhoto = est.establishment_photos?.find(p => p.photo_type === 'equipment')
            const isRejecting = rejectingId === est.id
            const isLoading = actionId === est.id

            return (
              <Card key={est.id} className="overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg">{est.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{est.address}
                      </p>
                      <p className="text-sm text-muted-foreground">{est.city}, {est.state}</p>
                    </div>
                    {activeTab === 'pending' ? (
                      <Badge variant="warning" className="shrink-0">
                        <Clock className="w-3 h-3 mr-1" />Pendente
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="shrink-0">
                        <XCircle className="w-3 h-3 mr-1" />Rejeitado
                      </Badge>
                    )}
                  </div>

                  {activeTab === 'rejected' && est.rejection_reason && (
                    <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400 space-y-1">
                      <p className="font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Motivo da rejeicao:
                      </p>
                      <p>{est.rejection_reason}</p>
                    </div>
                  )}

                  {activeTab === 'rejected' && (
                    <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      Aguardando correcao do responsavel
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />{est.contact_email ?? est.contact_phone ?? '---'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />{new Date(est.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { photo: placePhoto, label: 'Foto do Local' },
                      { photo: equipPhoto, label: 'Foto do Equipamento' },
                    ] as const).map(({ photo, label }) => (
                      <div key={label} className="space-y-1">
                        <p className="text-xs text-muted-foreground font-medium">{label}</p>
                        {photo ? (
                          <div className="relative group cursor-pointer" onClick={() => setEnlarged(photo.url)}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={photo.url} alt={label} className="w-full h-32 object-cover rounded-lg border border-border" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <ZoomIn className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-32 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                            <p className="text-xs text-muted-foreground">Sem foto</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {activeTab === 'pending' && (
                    <>
                      {isRejecting && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Motivo da Rejeicao *</p>
                          <textarea value={rejectReason}
                            onChange={e => { setRejectReason(e.target.value); setRejectError('') }}
                            placeholder="Descreva o motivo..." rows={3}
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none" />
                          {rejectError && (
                            <p className="text-xs text-destructive flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />{rejectError}
                            </p>
                          )}
                        </div>
                      )}
                      <div className="flex gap-3">
                        {!isRejecting ? (
                          <>
                            <Button onClick={() => approve(est)} disabled={isLoading}
                              className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white">
                              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                              Aprovar
                            </Button>
                            <Button variant="destructive" onClick={() => setRejectingId(est.id)} disabled={isLoading} className="flex-1 gap-2">
                              <XCircle className="w-4 h-4" />Rejeitar
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button variant="destructive" onClick={() => reject(est)} disabled={isLoading} className="flex-1 gap-2">
                              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                              Confirmar Rejeicao
                            </Button>
                            <Button variant="outline" onClick={() => { setRejectingId(null); setRejectReason(''); setRejectError('') }}
                              disabled={isLoading} className="flex-1">
                              Cancelar
                            </Button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {enlarged && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setEnlarged(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={enlarged} alt="Foto ampliada" className="max-w-full max-h-full object-contain rounded-xl"
            onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}
