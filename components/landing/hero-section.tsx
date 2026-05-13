'use client'

import Link from 'next/link'
import { HeartPulse, MapPin, ArrowRight, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeroSectionProps {
  totalActive: number
  totalCities: number
}

export function HeroSection({ totalActive, totalCities }: HeroSectionProps) {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
      {/* Gradient background */}
      <div className="absolute inset-0" style={{ background: 'var(--gradient-hero)' }} />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/6 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/6 w-48 h-48 rounded-full bg-primary/8 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full bg-destructive/5 blur-2xl animate-float" style={{ animationDelay: '4s' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <HeartPulse className="w-4 h-4 animate-heartbeat" />
              Salve vidas perto de você
            </div>

            {/* Heading */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Onde está o{' '}
                <span
                  className="text-transparent bg-clip-text"
                  style={{ backgroundImage: 'var(--gradient-cta)' }}
                >
                  DEA i.on
                </span>
                <br />
                mais próximo?
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-lg">
                Localize estabelecimentos com desfibrilador DEA verificado próximos a você.
                Em uma emergência cardíaca, cada segundo conta.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#mapa" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg hover:shadow-xl transition-shadow">
                  <MapPin className="w-5 h-5" />
                  Ver no Mapa
                </Button>
              </a>
              <a href="#produto" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
                  Conhecer o DEA i.on
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-4">
              <div>
                <p className="text-3xl font-bold text-foreground">{totalActive}</p>
                <p className="text-sm text-muted-foreground">Locais Verificados</p>
              </div>
              <div className="w-px bg-border" />
              <div>
                <p className="text-3xl font-bold text-foreground">{totalCities}</p>
                <p className="text-sm text-muted-foreground">Cidades</p>
              </div>
            </div>
          </div>

          {/* Hero card */}
          <div className="hidden lg:block animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div
              className="relative rounded-3xl p-8 border border-border/50"
              style={{ background: 'var(--gradient-card)', boxShadow: 'var(--shadow-card)' }}
            >
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg animate-glow">
                <HeartPulse className="w-10 h-10 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">DEA i.on</h3>
              <p className="text-sm text-muted-foreground mb-6">Desfibrilador Externo Automático</p>
              <div className="space-y-3">
                {[
                  { icon: ShieldCheck, text: 'Certificado ANVISA — uso leigo' },
                  { icon: HeartPulse, text: 'Feedback de RCP com display' },
                  { icon: MapPin, text: 'Verificado e ativo no mapa' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{text}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-border">
                <Link href="/auth/sign-up">
                  <Button className="w-full gap-2">
                    Cadastrar Meu Estabelecimento
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-border flex items-start justify-center pt-2">
          <div className="w-1 h-3 rounded-full bg-muted-foreground animate-float" />
        </div>
      </div>
    </section>
  )
}
