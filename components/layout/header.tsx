'use client'

import Link from 'next/link'
import { useState } from 'react'
import { HeartPulse, Menu, X, MapPin, Info, UserPlus, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth } from '@/lib/hooks/use-auth'
import { cn } from '@/lib/utils'

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, profile, signOut } = useAuth()

  const navLinks = [
    { href: '/#mapa', label: 'Ver Mapa', icon: MapPin },
    { href: '/#produto', label: 'O Produto', icon: Info },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm group-hover:shadow-md transition-all animate-heartbeat">
              <HeartPulse className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-lg text-foreground leading-none">ion-map</span>
              <span className="block text-xs text-muted-foreground leading-none">DEA i.on</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <>
                <Link href={profile?.role === 'admin' ? '/admin' : profile?.role === 'supervisor' ? '/supervisor' : '/painel'}>
                  <Button variant="ghost" size="sm">Painel</Button>
                </Link>
                <Button variant="outline" size="sm" onClick={signOut}>Sair</Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="gap-1.5">
                    <LogIn className="w-4 h-4" />
                    Entrar
                  </Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button size="sm" className="gap-1.5">
                    <UserPlus className="w-4 h-4" />
                    Cadastrar Local
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        'md:hidden border-t border-border bg-background/95 backdrop-blur-md transition-all duration-300',
        mobileOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
      )}>
        <div className="px-4 py-4 space-y-2">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-border space-y-2">
            {user ? (
              <>
                <Link href="/painel" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full">Painel</Button>
                </Link>
                <Button variant="ghost" className="w-full" onClick={() => { signOut(); setMobileOpen(false) }}>Sair</Button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full gap-2">
                    <LogIn className="w-4 h-4" /> Entrar
                  </Button>
                </Link>
                <Link href="/auth/sign-up" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full gap-2">
                    <UserPlus className="w-4 h-4" /> Cadastrar Local
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
