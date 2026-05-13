'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, MapPin, Clock, CheckCircle2, XCircle, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase'
import type { Establishment, Profile } from '@/lib/types'

interface Props { profile: Profile }

const STATUS_CONFIG = {
  active: { label: 'Ativo', variant: 'success' as const, icon: CheckCircle2 },
  pending: { label: 'Pendente', variant: 'warning' as const, icon: Clock },
  inactive: { label: 'Inativo', variant: 'destructive' as const, icon: XCircle },
}

export function ClientDashboard({ profile }: Props) {
  const [establishments, setEstablishments] = useState<Establishment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('establishments')
        .select('*, establishment_photos(*)')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
      setEstablishments((data as Establishment[]) ?? [])
      setLoading(false)
    }
    load()
  }, [profile.id])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Olá, {profile.name?.split(' ')[0] ?? 'usuário'} 👋
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie seus estabelecimentos no ion-map</p>
        </div>
        <Link href="/painel/novo">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Estabelecimento
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {(['active', 'pending', 'inactive'] as const).map(status => {
          const count = establishments.filter(e => e.status === status).length
          const { label, icon: Icon } = STATUS_CONFIG[status]
          return (
            <Card key={status}>
              <CardContent className="pt-6 text-center">
                <Icon className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold text-foreground">{count}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Establishments list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Meus Estabelecimentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : establishments.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <MapPin className="w-12 h-12 text-muted-foreground/50 mx-auto" />
              <p className="text-muted-foreground">Nenhum estabelecimento cadastrado ainda.</p>
              <Link href="/painel/novo">
                <Button variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" /> Cadastrar primeiro local
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {establishments.map(est => {
                const { label, variant } = STATUS_CONFIG[est.status]
                const hasPhotos = (est.establishment_photos?.length ?? 0) >= 2
                return (
                  <div key={est.id} className="flex items-start gap-4 p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      {est.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={est.logo_url} alt={est.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <Building2 className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground truncate">{est.name}</h3>
                        <Badge variant={variant}>{label}</Badge>
                        {!hasPhotos && est.status === 'pending' && (
                          <Badge variant="warning">⚠ Fotos pendentes</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        {est.city ? `${est.city}, ${est.state}` : est.address}
                      </p>
                      {est.rejection_reason && (
                        <p className="text-xs text-destructive mt-1">Motivo: {est.rejection_reason}</p>
                      )}
                    </div>
                    <Link href={`/painel/estabelecimento/${est.id}`}>
                      <Button variant="ghost" size="sm">Ver</Button>
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
