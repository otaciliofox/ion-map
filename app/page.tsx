'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { HeroSection } from '@/components/landing/hero-section'
import { MapSection } from '@/components/landing/map-section'
import { ProductSection } from '@/components/landing/product-section'
import { CtaSection } from '@/components/landing/cta-section'
import { createClient } from '@/lib/supabase'
import type { Establishment } from '@/lib/types'

export default function HomePage() {
  const [establishments, setEstablishments] = useState<Establishment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('establishments')
        .select('*, establishment_photos(*)')
        .eq('status', 'active')
      setEstablishments((data as Establishment[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const totalCities = new Set(establishments.map(e => e.city).filter(Boolean)).size

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {loading ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          </div>
        ) : (
          <>
            <HeroSection totalActive={establishments.length} totalCities={totalCities} />
            <MapSection establishments={establishments} />
            <ProductSection />
            <CtaSection />
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
