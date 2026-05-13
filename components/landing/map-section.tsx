import type { Establishment } from '@/lib/types'
import { Map } from '@/components/map'

interface MapSectionProps { establishments: Establishment[] }

export function MapSection({ establishments }: MapSectionProps) {
  return (
    <section id="mapa" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            Mapa de Desfibriladores
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Localize um DEA i.on perto de você
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Busque por cidade ou use sua localização para encontrar o DEA verificado mais próximo.
            Clique no marcador para ver detalhes e obter a rota.
          </p>
        </div>

        <div className="rounded-2xl shadow-xl border border-border overflow-hidden" style={{ height: '600px' }}>
          <Map establishments={establishments} />
        </div>
      </div>
    </section>
  )
}
