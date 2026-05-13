'use client'

import { useState } from 'react'
import { Battery, Monitor, Mic, ShieldCheck, Briefcase, Flag, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const PRODUCT_IMAGES = [
  { src: 'https://acdn-us.mitiendanube.com/stores/001/563/250/products/i-on-led-frontal-loja-394d3edeb5ec0b315517531291201591-480-0.webp', alt: 'DEA i.on — Frente com LEDs' },
  { src: 'https://acdn-us.mitiendanube.com/stores/001/563/250/products/i-on-led-diagonal-loja-ba0a2196e929dc44b017531291206837-480-0.webp', alt: 'DEA i.on — Vista diagonal' },
  { src: 'https://acdn-us.mitiendanube.com/stores/001/563/250/products/i-on-traseira-loja-28f81b04ad3a89fd5217531291206742-480-0.webp', alt: 'DEA i.on — Vista traseira' },
  { src: 'https://acdn-us.mitiendanube.com/stores/001/563/250/products/i-on-bolsa-loja-4ab812c9ea6397ceb617531291208802-480-0.webp', alt: 'DEA i.on — Com bolsa de transporte' },
]

const FEATURES = [
  {
    icon: Battery,
    title: 'Bateria Recarregável',
    desc: 'Nunca fique sem energia. Recarregável e sempre pronto para emergências.',
    color: 'text-amber-500',
  },
  {
    icon: Monitor,
    title: 'Feedback RCP com Display',
    desc: 'Orientação visual e sonora em tempo real sobre a qualidade das compressões.',
    color: 'text-blue-500',
  },
  {
    icon: Mic,
    title: 'Gravador de Som',
    desc: 'Registra o atendimento para análise posterior e melhoria contínua.',
    color: 'text-purple-500',
  },
  {
    icon: ShieldCheck,
    title: 'Certificado ANVISA',
    desc: 'Aprovado para uso leigo — qualquer pessoa pode operar sem treinamento prévio.',
    color: 'text-green-500',
  },
  {
    icon: Briefcase,
    title: 'Portátil',
    desc: 'Bolsa de transporte inclusa. Leve, compacto e sempre a mão quando mais precisa.',
    color: 'text-primary',
  },
  {
    icon: Flag,
    title: 'Fabricação Nacional',
    desc: 'Instramed — mais de 40 anos salvando vidas com tecnologia brasileira.',
    color: 'text-destructive',
  },
]

export function ProductSection() {
  const [activeImg, setActiveImg] = useState(0)

  return (
    <section id="produto" className="py-20 lg:py-28 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            O Equipamento
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Conheça o{' '}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'var(--gradient-cta)' }}>
              DEA i.on
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Tecnologia que salva vidas. Simples de usar, poderoso nas mãos certas — mesmo as sem treinamento.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden border border-border bg-card shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={PRODUCT_IMAGES[activeImg].src}
                alt={PRODUCT_IMAGES[activeImg].alt}
                className="w-full h-full object-contain p-4 transition-opacity duration-300"
              />
              <button
                onClick={() => setActiveImg((p) => (p - 1 + PRODUCT_IMAGES.length) % PRODUCT_IMAGES.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-background transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveImg((p) => (p + 1) % PRODUCT_IMAGES.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-background transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            {/* Thumbnails */}
            <div className="flex gap-2">
              {PRODUCT_IMAGES.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={cn(
                    'flex-1 aspect-square rounded-xl border-2 overflow-hidden transition-all',
                    activeImg === i ? 'border-primary shadow-md' : 'border-border opacity-60 hover:opacity-100'
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.src} alt={img.alt} className="w-full h-full object-contain p-1" />
                </button>
              ))}
            </div>
            {/* CTA */}
            <a
              href="https://www.loja.instramed.com.br/produtos/dea-i-on-basico-c-bateria-recarregavel-feedback-rcp-c-display/"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button variant="gradient" size="lg" className="w-full gap-2">
                Adquirir DEA i.on
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          </div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                className="p-5 rounded-xl border border-border bg-card hover:shadow-md transition-shadow group"
                style={{ background: 'var(--gradient-card)' }}
              >
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-muted group-hover:scale-110 transition-transform', color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
