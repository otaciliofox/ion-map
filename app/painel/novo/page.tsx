'use client'

import { useState, useEffect, useCallback, useRef, type ChangeEvent, type ReactNode, type FormEvent } from 'react'
import { Header } from '@/components/layout/header'
import { useAuth } from '@/lib/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase'
import { MiniMap } from '@/components/map/mini-map'
import { HeartPulse, MapPin, Camera, Loader2, AlertCircle, Navigation, CheckCircle2 } from 'lucide-react'

const BR_STATES = [
  { code: 'AC', name: 'Acre' }, { code: 'AL', name: 'Alagoas' }, { code: 'AP', name: 'Amapa' },
  { code: 'AM', name: 'Amazonas' }, { code: 'BA', name: 'Bahia' }, { code: 'CE', name: 'Ceara' },
  { code: 'DF', name: 'Distrito Federal' }, { code: 'ES', name: 'Espirito Santo' },
  { code: 'GO', name: 'Goias' }, { code: 'MA', name: 'Maranhao' }, { code: 'MT', name: 'Mato Grosso' },
  { code: 'MS', name: 'Mato Grosso do Sul' }, { code: 'MG', name: 'Minas Gerais' },
  { code: 'PA', name: 'Para' }, { code: 'PB', name: 'Paraiba' }, { code: 'PR', name: 'Parana' },
  { code: 'PE', name: 'Pernambuco' }, { code: 'PI', name: 'Piaui' },
  { code: 'RJ', name: 'Rio de Janeiro' }, { code: 'RN', name: 'Rio Grande do Norte' },
  { code: 'RS', name: 'Rio Grande do Sul' }, { code: 'RO', name: 'Rondonia' },
  { code: 'RR', name: 'Roraima' }, { code: 'SC', name: 'Santa Catarina' },
  { code: 'SP', name: 'Sao Paulo' }, { code: 'SE', name: 'Sergipe' }, { code: 'TO', name: 'Tocantins' },
]

interface FormValues {
  name: string; description: string; phone: string; email: string
  address: string; city: string; state: string; zip_code: string
}
interface FormErrors { [key: string]: string }
interface PhotoState { file: File | null; preview: string | null; error: string | null }
interface NominatimResult { lat: string; lon: string }
interface NominatimReverseResult {
  address?: {
    road?: string; house_number?: string; suburb?: string; neighbourhood?: string
    city?: string; town?: string; village?: string; municipality?: string
    state?: string; postcode?: string
  }
}

const BLANK: FormValues = { name: '', description: '', phone: '', email: '', address: '', city: '', state: '', zip_code: '' }
const NO_PHOTO: PhotoState = { file: null, preview: null, error: null }

// Map BR state names to codes
const STATE_NAME_TO_CODE: Record<string, string> = {
  'acre': 'AC', 'alagoas': 'AL', 'amapa': 'AP', 'amazonas': 'AM', 'bahia': 'BA',
  'ceara': 'CE', 'distrito federal': 'DF', 'espirito santo': 'ES', 'goias': 'GO',
  'maranhao': 'MA', 'mato grosso': 'MT', 'mato grosso do sul': 'MS', 'minas gerais': 'MG',
  'para': 'PA', 'paraiba': 'PB', 'parana': 'PR', 'pernambuco': 'PE', 'piaui': 'PI',
  'rio de janeiro': 'RJ', 'rio grande do norte': 'RN', 'rio grande do sul': 'RS',
  'rondonia': 'RO', 'roraima': 'RR', 'santa catarina': 'SC', 'sao paulo': 'SP',
  'sergipe': 'SE', 'tocantins': 'TO',
}

export default function NovoEstabelecimentoPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState<FormValues>(BLANK)
  const [lat, setLat] = useState(0)
  const [lng, setLng] = useState(0)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)
  const [geocoding, setGeocoding] = useState(false)
  const [reverseGeocoding, setReverseGeocoding] = useState(false)
  const [placePhoto, setPlacePhoto] = useState<PhotoState>(NO_PHOTO)
  const [equipPhoto, setEquipPhoto] = useState<PhotoState>(NO_PHOTO)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!loading && !user) router.replace('/auth/login')
  }, [user, loading, router])

  const geocode = useCallback(async (q: string) => {
    if (!q.trim() || q.trim().length < 5) return
    setGeocoding(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=br&limit=1`
      )
      const data = await res.json() as NominatimResult[]
      if (data[0]) { setLat(parseFloat(data[0].lat)); setLng(parseFloat(data[0].lon)) }
    } catch { /* silent */ } finally { setGeocoding(false) }
  }, [])

  // Reverse geocoding: coordinates -> address fields
  const reverseGeocode = useCallback(async (newLat: number, newLng: number) => {
    setReverseGeocoding(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}&addressdetails=1`,
        { headers: { 'Accept-Language': 'pt-BR' } }
      )
      const data = await res.json() as NominatimReverseResult
      if (data.address) {
        const a = data.address
        const road = a.road ?? ''
        const houseNumber = a.house_number ?? ''
        const suburb = a.suburb ?? a.neighbourhood ?? ''
        const addressStr = [road, houseNumber, suburb].filter(Boolean).join(', ')
        const cityStr = a.city ?? a.town ?? a.village ?? a.municipality ?? ''
        const zipStr = a.postcode?.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2') ?? ''

        // Map state name to code
        const stateRaw = (a.state ?? '').toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        const stateCode = STATE_NAME_TO_CODE[stateRaw] ?? ''

        setForm(prev => ({
          ...prev,
          ...(addressStr ? { address: addressStr } : {}),
          ...(cityStr ? { city: cityStr } : {}),
          ...(zipStr ? { zip_code: zipStr } : {}),
          ...(stateCode ? { state: stateCode } : {}),
        }))
      }
    } catch { /* silent */ } finally { setReverseGeocoding(false) }
  }, [])

  // Called when user clicks/drags on the mini-map
  const handleMapLocationChange = useCallback((newLat: number, newLng: number) => {
    setLat(newLat)
    setLng(newLng)
    reverseGeocode(newLat, newLng)
  }, [reverseGeocode])

  function setField(field: keyof FormValues, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
    if (field === 'address' || field === 'city' || field === 'state') {
      if (timer.current) clearTimeout(timer.current)
      const snap = { ...form, [field]: value }
      timer.current = setTimeout(() => geocode(`${snap.address} ${snap.city} ${snap.state} Brasil`), 900)
    }
  }

  function geolocate() {
    if (!navigator.geolocation) { setErrors(p => ({ ...p, geo: 'Geolocalizacao nao suportada.' })); return }
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      p => {
        setLat(p.coords.latitude)
        setLng(p.coords.longitude)
        setGeoLoading(false)
        reverseGeocode(p.coords.latitude, p.coords.longitude)
      },
      () => { setErrors(p => ({ ...p, geo: 'Nao foi possivel obter localizacao.' })); setGeoLoading(false) }
    )
  }

  function handlePhoto(e: ChangeEvent<HTMLInputElement>, type: 'place' | 'equipment') {
    const file = e.target.files?.[0]
    if (!file) return
    const set = type === 'place' ? setPlacePhoto : setEquipPhoto
    if (file.size > 5 * 1024 * 1024) { set(p => ({ ...p, error: 'Max 5MB.' })); return }
    if (!file.type.startsWith('image/')) { set(p => ({ ...p, error: 'Deve ser imagem.' })); return }
    set({ file, preview: URL.createObjectURL(file), error: null })
    setErrors(p => ({ ...p, [`photo_${type}`]: '' }))
  }

  function validate() {
    const e: FormErrors = {}
    if (!form.name.trim()) e.name = 'Obrigatorio.'
    if (!form.phone.trim()) e.phone = 'Obrigatorio.'
    if (!form.email.trim()) e.email = 'Obrigatorio.'
    if (!form.address.trim()) e.address = 'Obrigatorio.'
    if (!form.city.trim()) e.city = 'Obrigatorio.'
    if (!form.state) e.state = 'Obrigatorio.'
    if (!form.zip_code.trim()) e.zip_code = 'Obrigatorio.'
    if (!placePhoto.file) e.photo_place = 'Foto do local obrigatoria.'
    if (!equipPhoto.file) e.photo_equipment = 'Foto do equipamento obrigatoria.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate() || !user) return
    setSubmitting(true)
    try {
      const supabase = createClient()
      const { data: est, error: estErr } = await supabase
        .from('establishments')
        .insert({
          user_id: user.id, name: form.name, description: form.description || null,
          contact_phone: form.phone, contact_email: form.email,
          address: form.address, city: form.city, state: form.state,
          zip_code: form.zip_code, latitude: lat, longitude: lng, status: 'pending',
        })
        .select().single()
      if (estErr || !est) { setErrors({ submit: estErr?.message ?? 'Erro ao cadastrar.' }); setSubmitting(false); return }
      const estId = (est as { id: string }).id
      const uploads: { photoType: 'place' | 'equipment'; ps: PhotoState }[] = [
        { photoType: 'place', ps: placePhoto },
        { photoType: 'equipment', ps: equipPhoto },
      ]
      for (const { photoType, ps } of uploads) {
        if (!ps.file) continue
        const path = `${user.id}/${estId}/${photoType}.jpg`
        const { error: upErr } = await supabase.storage
          .from('establishment-photos')
          .upload(path, ps.file, { contentType: ps.file.type, upsert: true })
        if (upErr) { setErrors({ submit: `Erro no upload: ${upErr.message}` }); setSubmitting(false); return }
        const { data: { publicUrl } } = supabase.storage.from('establishment-photos').getPublicUrl(path)
        await supabase.from('establishment_photos').insert({ establishment_id: estId, photo_type: photoType, url: publicUrl })
      }
      router.push('/painel')
    } catch { setErrors({ submit: 'Erro inesperado.' }); setSubmitting(false) }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <HeartPulse className="w-10 h-10 text-primary animate-heartbeat" />
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16 max-w-2xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Cadastrar Estabelecimento</h1>
        <p className="text-muted-foreground mb-8">Registre um local com DEA i.on para salvar vidas.</p>
        <form onSubmit={onSubmit} className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Informacoes Basicas</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field label="Nome *" error={errors.name}>
                <Input value={form.name} onChange={e => setField('name', e.target.value)} placeholder="Ex: Farmacia Central" />
              </Field>
              <div className="space-y-2">
                <Label>Descricao</Label>
                <textarea value={form.description} onChange={e => setField('description', e.target.value)}
                  placeholder="Descreva o estabelecimento..." rows={3}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Telefone *" error={errors.phone}>
                  <Input value={form.phone} onChange={e => setField('phone', e.target.value)} placeholder="(11) 99999-9999" />
                </Field>
                <Field label="Email *" error={errors.email}>
                  <Input type="email" value={form.email} onChange={e => setField('email', e.target.value)} placeholder="contato@local.com" />
                </Field>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-4 h-4" />Localizacao
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Endereco *" error={errors.address}>
                <Input value={form.address} onChange={e => setField('address', e.target.value)} placeholder="Rua, numero, bairro" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Cidade *" error={errors.city}>
                  <Input value={form.city} onChange={e => setField('city', e.target.value)} placeholder="Sao Paulo" />
                </Field>
                <Field label="CEP *" error={errors.zip_code}>
                  <Input value={form.zip_code} onChange={e => setField('zip_code', e.target.value)} placeholder="00000-000" />
                </Field>
              </div>
              <Field label="Estado *" error={errors.state}>
                <select value={form.state} onChange={e => setField('state', e.target.value)}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="">Selecione</option>
                  {BR_STATES.map(s => <option key={s.code} value={s.code}>{s.name} ({s.code})</option>)}
                </select>
              </Field>
              <div className="flex items-center gap-3 flex-wrap">
                <Button type="button" variant="outline" onClick={geolocate} disabled={geoLoading} className="gap-2">
                  {geoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                  Usar minha localizacao
                </Button>
                {(lat !== 0 || lng !== 0) && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />{lat.toFixed(4)}, {lng.toFixed(4)}
                  </span>
                )}
                {(geocoding || reverseGeocoding) && (
                  <span className="text-xs text-muted-foreground animate-pulse flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {reverseGeocoding ? 'Obtendo endereço...' : 'Geocodificando...'}
                  </span>
                )}
              </div>
              {errors.geo && <Err msg={errors.geo} />}
              <div className="rounded-xl overflow-hidden border border-border">
                <MiniMap lat={lat} lng={lng} onLocationChange={handleMapLocationChange} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Camera className="w-4 h-4" />Fotos (obrigatorias)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <PhotoPicker label="Foto do Local" hint="Fachada ou area onde o DEA esta instalado"
                state={placePhoto} errMsg={errors.photo_place} onChange={e => handlePhoto(e, 'place')} />
              <PhotoPicker label="Foto do Equipamento DEA i.on" hint="Foto clara do desfibrilador DEA"
                state={equipPhoto} errMsg={errors.photo_equipment} onChange={e => handlePhoto(e, 'equipment')} />
            </CardContent>
          </Card>

          {errors.submit && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{errors.submit}
            </div>
          )}
          <Button type="submit" disabled={submitting} className="w-full gap-2">
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? 'Enviando...' : 'Cadastrar Estabelecimento'}
          </Button>
        </form>
      </main>
    </div>
  )
}

function Err({ msg }: { msg: string }) {
  return <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{msg}</p>
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <Err msg={error} />}
    </div>
  )
}

interface PickerProps {
  label: string; hint: string; state: PhotoState; errMsg?: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}

function PhotoPicker({ label, hint, state, errMsg, onChange }: PickerProps) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div className="space-y-2">
      <Label>{label} *</Label>
      <p className="text-xs text-muted-foreground">{hint}</p>
      <div className="relative border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => ref.current?.click()}>
        {state.preview ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={state.preview} alt={label} className="w-full h-40 object-cover rounded-lg" />
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <p className="text-white text-sm">Alterar foto</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-4 text-muted-foreground">
            <Camera className="w-8 h-8" />
            <p className="text-sm">Clique para selecionar</p>
            <p className="text-xs">JPG, PNG, WebP - max 5MB</p>
          </div>
        )}
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={onChange} />
      </div>
      {state.error && <Err msg={state.error} />}
      {errMsg && !state.file && <Err msg={errMsg} />}
    </div>
  )
}
