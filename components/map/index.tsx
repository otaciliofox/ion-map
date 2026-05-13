'use client'

import dynamic from 'next/dynamic'
import type { Establishment } from '@/lib/types'

const MapComponent = dynamic(() => import('./map-component').then(m => m.MapComponent), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-muted/30 rounded-xl">
      <div className="text-center space-y-2">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground">Carregando mapa...</p>
      </div>
    </div>
  ),
})

interface MapProps {
  establishments: Establishment[]
}

export function Map({ establishments }: MapProps) {
  return <MapComponent establishments={establishments} />
}
