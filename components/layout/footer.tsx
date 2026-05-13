import Link from 'next/link'
import { HeartPulse, ExternalLink } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <HeartPulse className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-foreground">ion-map</span>
              <span className="text-xs text-muted-foreground ml-2">powered by DEA i.on Instramed</span>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link href="/#mapa" className="hover:text-foreground transition-colors">Mapa</Link>
            <Link href="/#produto" className="hover:text-foreground transition-colors">Produto</Link>
            <Link href="/auth/sign-up" className="hover:text-foreground transition-colors">Cadastrar Local</Link>
            <a
              href="https://www.instramed.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              instramed.com.br <ExternalLink className="w-3 h-3" />
            </a>
          </nav>

          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} Instramed. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
