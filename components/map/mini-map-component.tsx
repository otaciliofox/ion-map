'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const markerIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = markerIcon

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => { map.setView([lat, lng], 15) }, [lat, lng, map])
  return null
}

export interface MiniMapComponentProps { lat: number; lng: number }

export function MiniMapComponent({ lat, lng }: MiniMapComponentProps) {
  const has = lat !== 0 || lng !== 0
  const center: [number, number] = has ? [lat, lng] : [-15.7801, -47.9292]
  return (
    <MapContainer center={center} zoom={has ? 15 : 5} className="w-full h-[200px] rounded-xl" style={{ zIndex: 0 }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {has && (
        <>
          <Marker position={[lat, lng]} icon={markerIcon} />
          <FlyTo lat={lat} lng={lng} />
        </>
      )}
    </MapContainer>
  )
}
