'use client'

import dynamic from 'next/dynamic'
import type { MiniMapComponentProps } from './mini-map-component'

const MiniMapDynamic = dynamic(
  () => import('./mini-map-component').then(m => m.MiniMapComponent),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[200px] rounded-xl bg-muted/30 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
)

export function MiniMap(props: MiniMapComponentProps) {
  return <MiniMapDynamic {...props} />
}
