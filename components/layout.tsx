import Image from 'next/image'
import Link from 'next/link'
import { Instagram, MapPin, Truck, Heart, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-4 group">
            <Image
              src="/images/logo.png"
              alt="Bibliopatas"
              width={72}
              height={72}
              className="rounded-full shadow-sm group-hover:scale-105 transition-transform"
            />
            <span className="font-serif italic text-2xl text-primary hidden sm:block tracking-wide">Bibliopatas</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <a 
              href="https://instagram.com/bibliopatas.df" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              <Instagram className="w-4 h-4" />
              <span className="hidden sm:inline">@bibliopatas.df</span>
            </a>
            <Link 
               href="/admin/login" 
               className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export function Hero() {
  return (
    <section className="bg-background py-16 sm:py-24 relative border-b border-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="tracking-tight text-[10px] text-muted-foreground mb-6 font-sans">
          projeto biblioteca animal
        </div>
        <div className="flex justify-center mb-8">
          <Image
            src="/images/logo.png"
            alt="Bibliopatas - Livros que salvam vidas"
            width={170}
            height={170}
            className="rounded-full shadow-sm"
          />
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-foreground mb-6 leading-tight">
          Livros <span className="italic font-light text-primary">que salvam</span> vidas.
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto font-sans font-light leading-relaxed">
          Cada página lida financia abrigos e protetores independentes cuidando de animais de rua.
        </p>
        
        <div className="flex flex-wrap justify-center gap-8 text-[11px] font-sans tracking-tight text-muted-foreground">
          <span className="flex items-center gap-2 border-b border-border/50 pb-1">
            <MapPin className="w-3.5 h-3.5" /> Brasília - DF
          </span>
          <span className="flex items-center gap-2 border-b border-border/50 pb-1">
            <Truck className="w-3.5 h-3.5" /> Enviamos para todo o Brasil • frete à parte
          </span>
          <span className="flex items-center gap-2 border-b border-border/50 pb-1">
            <Heart className="w-3.5 h-3.5 text-primary" /> Ajude os animais
          </span>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="Bibliopatas"
              width={48}
              height={48}
              className="rounded-full shadow-sm"
            />
            <span className="text-sm text-muted-foreground">
              Projeto Biblioteca Animal
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <a 
              href="https://instagram.com/bibliopatas.df" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors flex items-center gap-2"
            >
              <Instagram className="w-4 h-4" />
              @bibliopatas.df
            </a>
            <a
              href="/privacy"
              className="hover:text-foreground transition-colors text-xs uppercase tracking-[0.18em]"
            >
              Política de Privacidade
            </a>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p className="flex flex-col items-center justify-center gap-2 sm:flex-row">
            <span className="inline-flex items-center gap-2 text-center">
              Feito com amor para ajudar nossos amiguinhos de quatro patas
              <Heart className="w-4 h-4 text-primary" />
            </span>
            <a
              href="https://kleuvyn.tec.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2"
            >
              Kleuvyn
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
