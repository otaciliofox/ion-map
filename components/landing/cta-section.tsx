import Link from 'next/link'
import { UserPlus, ArrowRight, HeartPulse } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CtaSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="relative overflow-hidden rounded-3xl p-8 lg:p-16 text-center"
          style={{ background: 'var(--gradient-cta)' }}
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                <HeartPulse className="w-8 h-8 text-white animate-heartbeat" />
              </div>
            </div>

            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Seu estabelecimento tem um DEA i.on?
              </h2>
              <p className="text-white/80 text-lg max-w-2xl mx-auto">
                Cadastre-se gratuitamente e apareça no mapa. Mostre que seu local é seguro
                e ajude a salvar vidas na sua comunidade.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/auth/sign-up">
                <Button size="xl" variant="secondary" className="gap-2 shadow-lg">
                  <UserPlus className="w-5 h-5" />
                  Cadastrar Meu Estabelecimento
                </Button>
              </Link>
              <a
                href="https://www.loja.instramed.com.br/produtos/dea-i-on-basico-c-bateria-recarregavel-feedback-rcp-c-display/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="xl" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10">
                  Adquirir um DEA
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
