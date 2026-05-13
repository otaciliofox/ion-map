'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Establishment } from '@/lib/types'
import { MapPin, Phone, Navigation, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import 'leaflet/dist/leaflet.css'

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

L.Marker.prototype.options.icon = activeIcon

interface FlyToProps { lat: number; lng: number; zoom?: number }
function FlyTo({ lat, lng, zoom = 14 }: FlyToProps) {
  const map = useMap()
  useEffect(() => { map.flyTo([lat, lng], zoom, { duration: 1.5 }) }, [lat, lng, zoom, map])
  return null
}

function LocationMarker() {
  const [pos, setPos] = useState<L.LatLng | null>(null)
  const map = useMap()
  useEffect(() => {
    map.locate({ setView: false, maxZoom: 14 })
    map.on('locationfound', (e) => { setPos(e.latlng); map.flyTo(e.latlng, 14) })
  }, [map])
  return pos ? <Marker position={pos} icon={userIcon}><Popup><p className="font-medium text-sm">Você está aqui</p></Popup></Marker> : null
}

interface MapComponentProps { establishments: Establishment[] }

export function MapComponent({ establishments }: MapComponentProps) {
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [locate, setLocate] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function searchCity() {
    if (!searchQuery.trim()) return
    setSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=br&limit=1`
      )
      const data = await res.json()
      if (data[0]) setFlyTarget({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) })
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="relative w-full h-full">
      {/* Search bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchCity()}
            placeholder="Buscar cidade ou bairro..."
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-border bg-background/95 backdrop-blur-sm text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          )}
        </div>
        <Button size="sm" onClick={searchCity} disabled={searching} className="shadow-md shrink-0">
          {searching ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Buscar'}
        </Button>
        <Button size="icon" variant="outline" onClick={() => setLocate(l => !l)} className="shadow-md shrink-0 bg-background/95" title="Minha localização">
          <Navigation className="w-4 h-4" />
        </Button>
      </div>

      <MapContainer
        center={[-15.7801, -47.9292]}
        zoom={5}
        className="w-full h-full rounded-xl"
        style={{ minHeight: '500px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locate && <LocationMarker />}
        {flyTarget && <FlyTo lat={flyTarget.lat} lng={flyTarget.lng} />}

        {establishments.filter(e => e.status === 'active').map(est => (
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
                  <img
                    src={est.establishment_photos.find(p => p.photo_type === 'equipment')!.url}
                    alt="Equipamento DEA"
                    className="w-full h-20 object-cover rounded"
                  />
                )}
                <Button
                  size="sm"
                  className="w-full gap-1 text-xs"
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${est.latitude},${est.longitude}`, '_blank')}
                >
                  <Navigation className="w-3 h-3" /> Ver Rota
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border z-[1000]">
        <p className="text-xs font-semibold mb-2">Legenda</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs"><div className="w-3 h-3 rounded-full bg-orange-500" /><span className="text-muted-foreground">DEA Verificado</span></div>
          <div className="flex items-center gap-2 text-xs"><div className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-muted-foreground">Você</span></div>
        </div>
      </div>
    </div>
  )
}
