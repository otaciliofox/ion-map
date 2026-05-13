'use client'

import { useCallback, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const markerIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
})
L.Marker.prototype.options.icon = markerIcon

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => { map.setView([lat, lng], 15) }, [lat, lng, map])
  return null
}

interface ClickHandlerProps { onLocationChange?: (lat: number, lng: number) => void }
function ClickHandler({ onLocationChange }: ClickHandlerProps) {
  useMapEvents({
    click(e) { onLocationChange?.(e.latlng.lat, e.latlng.lng) },
  })
  return null
}

export interface MiniMapComponentProps {
  lat: number
  lng: number
  onLocationChange?: (lat: number, lng: number) => void
}

export function MiniMapComponent({ lat, lng, onLocationChange }: MiniMapComponentProps) {
  const has = lat !== 0 || lng !== 0
  const center: [number, number] = has ? [lat, lng] : [-8.1130, -34.8963] // Recife (closer to seed data)

  const handleDragEnd = useCallback((e: L.DragEndEvent) => {
    const { lat: newLat, lng: newLng } = (e.target as L.Marker).getLatLng()
    onLocationChange?.(newLat, newLng)
  }, [onLocationChange])

  return (
    <div className="relative">
      <MapContainer center={center} zoom={has ? 15 : 5} className="w-full h-[200px] rounded-xl" style={{ zIndex: 0 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {onLocationChange && <ClickHandler onLocationChange={onLocationChange} />}
        {has && (
          <>
            <Marker
              position={[lat, lng]}
              icon={markerIcon}
              draggable={!!onLocationChange}
              eventHandlers={onLocationChange ? { dragend: handleDragEnd } : {}}
            />
            <FlyTo lat={lat} lng={lng} />
          </>
        )}
      </MapContainer>
      {onLocationChange && (
        <p className="text-xs text-muted-foreground mt-1 text-center">
          Clique no mapa ou arraste o marcador para ajustar a posição
        </p>
      )}
    </div>
  )
}
