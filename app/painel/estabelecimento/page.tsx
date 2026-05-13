'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Phone, Mail, Clock, CheckCircle2, XCircle, Upload, HeartPulse } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { useAuth } from '@/lib/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase'
import type { Establishment } from '@/lib/types'

const STATUS_CONFIG = {
  active:   { label: 'Ativo',    variant: 'success' as const,     icon: CheckCircle2 },
  pending:  { label: 'Pendente', variant: 'warning' as const,     icon: Clock },
  inactive: { label: 'Inativo',  variant: 'destructive' as const, icon: XCircle },
}

function EstabelecimentoDetail() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [est, setEst] = useState<Establishment | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) router.replace('/auth/login')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!id || !user) return
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('establishments')
        .select('*, establishment_photos(*)')
        .eq('id', id)
        .maybeSingle()
      setEst(data as Establishment | null)
      setLoading(false)
    }
    load()
  }, [id, user])

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>, photoType: 'place' | 'equipment') {
    const file = e.target.files?.[0]
    if (!file || !user || !est) return
    if (file.size > 5 * 1024 * 1024) { alert('Foto deve ter no máximo 5MB'); return }
    setUploading(true)
    const supabase = createClient()
    const path = `${user.id}/${est.id}/${photoType}-${Date.now()}.jpg`
    const { data: upload, error } = await supabase.storage
      .from('establishment-photos')
      .upload(path, file, { upsert: true })
    if (error) { alert('Erro ao enviar foto: ' + error.message); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('establishment-photos').getPublicUrl(upload.path)
    await supabase.from('establishment_photos').delete().eq('establishment_id', est.id).eq('photo_type', photoType)
    await supabase.from('establishment_photos').insert({ establishment_id: est.id, photo_type: photoType, url: publicUrl })
    const { data } = await supabase.from('establishments').select('*, establishment_photos(*)').eq('id', est.id).maybeSingle()
    setEst(data as Establishment | null)
    setUploading(false)
  }

  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <HeartPulse className="w-10 h-10 text-primary animate-heartbeat" />
    </div>
  )

  if (!est) return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Estabelecimento não encontrado.</p>
          <Link href="/painel"><Button variant="outline">Voltar ao painel</Button></Link>
        </div>
      </main>
    </div>
  )

  const { label, variant, icon: StatusIcon } = STATUS_CONFIG[est.status]
  const placePhoto = est.establishment_photos?.find(p => p.photo_type === 'place')
  const equipPhoto = est.establishment_photos?.find(p => p.photo_type === 'equipment')
  const hasBothPhotos = !!(placePhoto && equipPhoto)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          <div className="flex items-center gap-3">
            <Link href="/painel">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="w-4 h-4" /> Voltar
              </Button>
            </Link>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">{est.name}</h1>
              <Badge variant={variant} className="gap-1"><StatusIcon className="w-3 h-3" /> {label}</Badge>
            </div>
          </div>

          {est.status === 'pending' && !hasBothPhotos && (
            <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-600 dark:text-yellow-400">
              ⚠️ <strong>Ação necessária:</strong> Envie as fotos do local e do equipamento para aprovação.
            </div>
          )}
          {est.status === 'pending' && hasBothPhotos && (
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 text-sm text-blue-600 dark:text-blue-400">
              ✓ Fotos enviadas. Aguardando aprovação do supervisor.
            </div>
          )}
          {est.status === 'inactive' && est.rejection_reason && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
              ✗ <strong>Reprovado:</strong> {est.rejection_reason}
            </div>
          )}

          <Card>
            <CardHeader><CardTitle>Informações</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {est.description && <p className="text-muted-foreground">{est.description}</p>}
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{est.address}{est.city ? `, ${est.city} - ${est.state}` : ''}</span>
              </div>
              {est.contact_phone && <div className="flex items-center gap-2 text-muted-foreground"><Phone className="w-4 h-4" /><span>{est.contact_phone}</span></div>}
              {est.contact_email && <div className="flex items-center gap-2 text-muted-foreground"><Mail className="w-4 h-4" /><span>{est.contact_email}</span></div>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Fotos do Cadastro</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(['place', 'equipment'] as const).map(type => {
                  const photo = type === 'place' ? placePhoto : equipPhoto
                  const photoLabel = type === 'place' ? 'Foto do Local' : 'Foto do Equipamento DEA'
                  return (
                    <div key={type} className="space-y-2">
                      <p className="text-sm font-medium">{photoLabel}</p>
                      {photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photo.url} alt={photoLabel} className="w-full h-48 object-cover rounded-lg border border-border" />
                      ) : (
                        <div className="w-full h-48 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground text-sm">Sem foto</div>
                      )}
                      {est.status === 'pending' && (
                        <label className="cursor-pointer block">
                          <input type="file" accept="image/*" className="hidden" onChange={e => handlePhotoUpload(e, type)} disabled={uploading} />
                          <Button variant="outline" size="sm" className="w-full gap-2 pointer-events-none">
                            <Upload className="w-3 h-3" /> {photo ? 'Trocar foto' : 'Enviar foto'}
                          </Button>
                        </label>
                      )}
                    </div>
                  )
                })}
              </div>
              {uploading && <p className="text-sm text-muted-foreground text-center mt-4 animate-pulse">Enviando foto...</p>}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function EstabelecimentoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><HeartPulse className="w-10 h-10 text-primary animate-heartbeat" /></div>}>
      <EstabelecimentoDetail />
    </Suspense>
  )
}
