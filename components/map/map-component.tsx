'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Establishment } from '@/lib/types'
import { MapPin, Phone, Navigation, Search, X, Building2, Map, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase'
import { useTheme } from 'next-themes'
import 'leaflet/dist/leaflet.css'

// Icons
const activeIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
})
const userIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
})
const highlightIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [30, 49], iconAnchor: [15, 49], popupAnchor: [1, -34], shadowSize: [41, 41],
})
L.Marker.prototype.options.icon = activeIcon

// Tile themes
const THEMES = {
  voyager: { label: 'Navegação', url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>' },
  dark:    { label: 'Escuro',    url: 'https://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web_grau/default/WEBMERCATOR/{z}/{y}/{x}.png', attribution: '&copy; <a href="https://www.bkg.bund.de">BKG</a>' },
  light:   { label: 'Claro',    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>' },
} as const
type ThemeKey = keyof typeof THEMES

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

interface FlyToProps { lat: number; lng: number; zoom?: number }
function FlyTo({ lat, lng, zoom = 14 }: FlyToProps) {
  const map = useMap()
  useEffect(() => { map.flyTo([lat, lng], zoom, { duration: 1.5 }) }, [lat, lng, zoom, map])
  return null
}

interface LocationMarkerProps {
  establishments: Establishment[]
  onLocated: (lat: number, lng: number) => void
  onDenied: () => void
}
function LocationMarker({ establishments, onLocated, onDenied }: LocationMarkerProps) {
  const [pos, setPos] = useState<L.LatLng | null>(null)
  const map = useMap()
  useEffect(() => {
    map.locate({ setView: false, maxZoom: 16 })
    map.on('locationfound', (e) => {
      setPos(e.latlng)
      onLocated(e.latlng.lat, e.latlng.lng)
      const active = establishments.filter(est => est.status === 'active' && est.latitude && est.longitude)
      if (active.length > 0) {
        const nearest = active.reduce((best, est) => {
          const d = haversineKm(e.latlng.lat, e.latlng.lng, est.latitude, est.longitude)
          const dBest = haversineKm(e.latlng.lat, e.latlng.lng, best.latitude, best.longitude)
          return d < dBest ? est : best
        })
        const distKm = haversineKm(e.latlng.lat, e.latlng.lng, nearest.latitude, nearest.longitude)
        const mid: [number, number] = distKm <= 50
          ? [(e.latlng.lat + nearest.latitude) / 2, (e.latlng.lng + nearest.longitude) / 2]
          : [e.latlng.lat, e.latlng.lng]
        map.flyTo(mid, 13, { duration: 1.5 })
      } else {
        map.flyTo(e.latlng, 13, { duration: 1.5 })
      }
    })
    map.on('locationerror', () => { onDenied() })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])
  return pos ? (
    <Marker position={pos} icon={userIcon}>
      <Popup><p className="font-medium text-sm">Você está aqui</p></Popup>
    </Marker>
  ) : null
}

// Search result highlight marker (bigger, red) that auto-opens popup
function HighlightMarker({ est }: { est: Establishment }) {
  const markerRef = useRef<L.Marker | null>(null)
  useEffect(() => {
    setTimeout(() => markerRef.current?.openPopup(), 400)
  }, [est.id])
  return (
    <Marker
      ref={markerRef}
      position={[est.latitude, est.longitude]}
      icon={highlightIcon}
      zIndexOffset={1000}
    >
      <Popup>
        <div className="min-w-[200px] space-y-2">
          <div className="flex items-center gap-1">
            <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-medium">Resultado</span>
          </div>
          <h3 className="font-semibold text-sm">{est.name}</h3>
          {est.city && <p className="text-xs text-gray-500">{est.city}, {est.state}</p>}
          {est.description && <p className="text-xs text-gray-600 line-clamp-2">{est.description}</p>}
          <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{est.address}</p>
          {est.contact_phone && <p className="text-xs text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" />{est.contact_phone}</p>}
          <Button size="sm" className="w-full gap-1 text-xs"
            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${est.latitude},${est.longitude}`, '_blank')}>
            <Navigation className="w-3 h-3" /> Ver Rota
          </Button>
        </div>
      </Popup>
    </Marker>
  )
}

interface MapComponentProps { establishments: Establishment[] }

export function MapComponent({ establishments }: MapComponentProps) {
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number; zoom?: number } | null>(null)
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null)
  const [geoAllowed, setGeoAllowed] = useState<boolean | null>(null) // null = loading, true = ok, false = denied
  const [searchQuery, setSearchQuery] = useState('')
  const [searchMode, setSearchMode] = useState<'city' | 'establishment'>('city')
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [highlightEst, setHighlightEst] = useState<Establishment | null>(null)
  // Sync map theme with site theme (next-themes)
  const { resolvedTheme } = useTheme()
  const defaultMapTheme: ThemeKey = resolvedTheme === 'light' ? 'light' : 'voyager'
  const [theme, setTheme] = useState<ThemeKey>(defaultMapTheme)

  // Auto-update map theme when site theme changes (unless user manually picked)
  const [userOverrode, setUserOverrode] = useState(false)
  useEffect(() => {
    if (!userOverrode) {
      setTheme(resolvedTheme === 'light' ? 'light' : 'voyager')
    }
  }, [resolvedTheme, userOverrode])
  const [showThemePicker, setShowThemePicker] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleLocated = useCallback((lat: number, lng: number) => {
    setUserPos({ lat, lng })
    setGeoAllowed(true)
  }, [])

  const handleDenied = useCallback(() => {
    setGeoAllowed(false)
  }, [])

  async function handleSearch() {
    if (!searchQuery.trim()) return
    setSearching(true)
    setSearchError('')
    setHighlightEst(null)

    if (searchMode === 'establishment') {
      // Search our database
      try {
        const supabase = createClient()
        const q = searchQuery.trim().toLowerCase()
        const { data } = await supabase
          .from('establishments')
          .select('*, establishment_photos(*)')
          .eq('status', 'active')
          .or(`name.ilike.%${q}%,city.ilike.%${q}%`)
          .order('name')
          .limit(1)
        const result = data?.[0] as Establishment | undefined
        if (result) {
          setFlyTarget({ lat: result.latitude, lng: result.longitude, zoom: 15 })
          setHighlightEst(result)
        } else {
          setSearchError('Nenhum estabelecimento encontrado.')
        }
      } finally {
        setSearching(false)
      }
    } else {
      // Search city via Nominatim
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=br&limit=1`
        )
        const data = await res.json() as Array<{ lat: string; lon: string }>
        if (data[0]) {
          setFlyTarget({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), zoom: 13 })
        } else {
          setSearchError('Cidade não encontrada. Tente outro nome.')
        }
      } finally {
        setSearching(false)
      }
    }
  }

  const activeEstablishments = establishments.filter(e => e.status === 'active')
  const tileConfig = THEMES[theme]

  return (
    <div className="relative w-full h-full" onClick={() => setShowThemePicker(false)}>
      {/* ── Search bar ── */}
      <div className="absolute top-4 left-4 right-4 z-[1000] space-y-2">
        {/* Mode toggle + input + buttons */}
        <div className="flex gap-2">
          {/* Mode toggle */}
          <div className="flex rounded-lg border border-border bg-background/95 backdrop-blur-sm shadow-md overflow-hidden shrink-0">
            <button
              onClick={() => { setSearchMode('city'); setSearchError('') }}
              className={`flex items-center gap-1.5 px-3 h-10 text-xs font-medium transition-colors ${searchMode === 'city' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              title="Buscar por cidade"
            >
              <Map className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cidade</span>
            </button>
            <button
              onClick={() => { setSearchMode('establishment'); setSearchError('') }}
              className={`flex items-center gap-1.5 px-3 h-10 text-xs font-medium transition-colors ${searchMode === 'establishment' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              title="Buscar estabelecimento"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Local</span>
            </button>
          </div>

          {/* Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              ref={inputRef}
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setSearchError('') }}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder={searchMode === 'city' ? 'Buscar cidade ou bairro...' : 'Buscar por nome ou cidade...'}
              className="w-full h-10 pl-9 pr-8 rounded-lg border border-border bg-background/95 backdrop-blur-sm text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setSearchError(''); setHighlightEst(null) }}
                className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Buscar */}
          <Button size="sm" onClick={handleSearch} disabled={searching} className="shadow-md shrink-0 h-10">
            {searching
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : 'Buscar'}
          </Button>

          {/* Localização */}
          <Button size="icon" variant="outline"
            onClick={() => userPos ? setFlyTarget({ ...userPos, zoom: 14 }) : inputRef.current?.focus()}
            className="shadow-md shrink-0 bg-background/95 h-10 w-10"
            title={userPos ? 'Ir para minha localização' : 'Localização não disponível'}>
            <Navigation className={`w-4 h-4 ${userPos ? '' : 'opacity-40'}`} />
          </Button>

          {/* Theme toggle */}
          <div className="relative">
            <Button size="icon" variant="outline"
              onClick={(e) => { e.stopPropagation(); setShowThemePicker(p => !p) }}
              className="shadow-md shrink-0 bg-background/95 h-10 w-10"
              title="Tema do mapa">
              <Palette className="w-4 h-4" />
            </Button>
            {showThemePicker && (
              <div className="absolute right-0 top-12 bg-background border border-border rounded-lg shadow-lg py-1 z-[1100] min-w-[130px]">
                {(Object.entries(THEMES) as [ThemeKey, typeof THEMES[ThemeKey]][]).map(([key, t]) => (
                  <button key={key} onClick={() => { setTheme(key); setUserOverrode(true); setShowThemePicker(false) }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${theme === key ? 'text-primary font-medium' : 'text-foreground'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Error / no-geo hint */}
        {searchError && (
          <div className="bg-background/95 backdrop-blur-sm border border-destructive/30 text-destructive text-xs px-3 py-2 rounded-lg shadow-md">
            {searchError}
          </div>
        )}
        {geoAllowed === false && !searchError && (
          <div className="bg-background/95 backdrop-blur-sm border border-border text-muted-foreground text-xs px-3 py-2 rounded-lg shadow-md">
            📍 Localização não permitida. Digite uma cidade acima para encontrar DEAs próximos.
          </div>
        )}
      </div>

      {/* ── Map ── */}
      <MapContainer
        center={[-15.7801, -47.9292]}
        zoom={5}
        className="w-full h-full rounded-xl"
        style={{ minHeight: '500px' }}
      >
        <TileLayer key={theme} attribution={tileConfig.attribution} url={tileConfig.url} />

        <LocationMarker establishments={activeEstablishments} onLocated={handleLocated} onDenied={handleDenied} />

        {flyTarget && <FlyTo lat={flyTarget.lat} lng={flyTarget.lng} zoom={flyTarget.zoom} />}

        {/* Highlighted search result (bigger marker + auto-open popup) */}
        {highlightEst && <HighlightMarker key={highlightEst.id} est={highlightEst} />}

        {/* All active establishments */}
        {activeEstablishments
          .filter(est => est.id !== highlightEst?.id) // don't double-render highlighted one
          .map(est => (
            <Marker key={est.id} position={[est.latitude, est.longitude]} icon={activeIcon}>
              <Popup>
                <div className="min-w-[200px] space-y-2">
                  <div>
                    <h3 className="font-semibold text-sm">{est.name}</h3>
                    {est.city && <p className="text-xs text-gray-500">{est.city}, {est.state}</p>}
                  </div>
                  {est.description && <p className="text-xs text-gray-600 line-clamp-2">{est.description}</p>}
                  <div className="space-y-1 text-xs text-gray-500">
                    <p className="flex items-center gap-1"><MapPin className="w-3 h-3" />{est.address}</p>
                    {est.contact_phone && <p className="flex items-center gap-1"><Phone className="w-3 h-3" />{est.contact_phone}</p>}
                  </div>
                  {est.establishment_photos?.find(p => p.photo_type === 'equipment') && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={est.establishment_photos.find(p => p.photo_type === 'equipment')!.url}
                      alt="Equipamento DEA" className="w-full h-20 object-cover rounded" />
                  )}
                  <Button size="sm" className="w-full gap-1 text-xs"
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${est.latitude},${est.longitude}`, '_blank')}>
                    <Navigation className="w-3 h-3" /> Ver Rota
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {/* ── Legend ── */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border z-[1000]">
        <p className="text-xs font-semibold mb-2">Legenda</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs"><div className="w-3 h-3 rounded-full bg-orange-500" /><span className="text-muted-foreground">DEA Verificado</span></div>
          <div className="flex items-center gap-2 text-xs"><div className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-muted-foreground">Você</span></div>
          {highlightEst && <div className="flex items-center gap-2 text-xs"><div className="w-3 h-3 rounded-full bg-red-500" /><span className="text-muted-foreground">Resultado</span></div>}
        </div>
      </div>
    </div>
  )
}
