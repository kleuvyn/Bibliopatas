'use client'

import { useState } from 'react'
import { Book } from '@/lib/types'
import Image from 'next/image'
import { MessageCircle, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { isGoogleBooksCover, upgradeGoogleBooksCoverUrl } from '@/lib/cover'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface BookCardProps {
  book: Book
  whatsappNumber: string
}

export function BookCard({ book, whatsappNumber }: BookCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const coverUrl = upgradeGoogleBooksCoverUrl(book.cover_url)

  const conditionColors = {
    novo: 'bg-primary text-primary-foreground',
    seminovo: 'bg-secondary text-secondary-foreground',
    usado: 'bg-muted text-muted-foreground',
  }

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Oi! Tenho interesse no livro "${book.title}" de ${book.author} por R$ ${book.price.toFixed(2).replace('.', ',')}. Ainda esta disponivel?`
    )
    const cleanNumber = whatsappNumber.replace(/\D/g, '')
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank')
  }

  return (
    <>
      <article
        onClick={() => setIsDetailsOpen(true)}
        className="group w-full max-w-[300px] mx-auto bg-card text-left transition-all duration-500 hover:-translate-y-1 cursor-pointer"
      >
        <div className="relative aspect-[3/4] bg-secondary border border-border p-3 shadow-md mx-2 mt-2">
          <div className="relative w-full h-full overflow-hidden bg-muted flex items-center justify-center">
            <Image
              src={coverUrl ?? '/placeholder.jpg'}
              alt={coverUrl ? `Capa de ${book.title}` : 'Capa padrão de livro'}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 280px"
              quality={100}
              unoptimized={false}
            />
          </div>
          <Badge 
            className={`absolute top-0 right-0 translate-x-2 -translate-y-2 ${conditionColors[book.condition]} border border-border/50 text-[10px] uppercase tracking-widest font-sans shadow-sm`}
          >
            {book.condition}
          </Badge>
        </div>
        
        <div className="p-5 text-center space-y-3">
          <div>
            <h3 className="font-serif text-lg text-foreground line-clamp-2 leading-tight italic">
              {book.title}
            </h3>
            <p className="text-[10px] font-sans tracking-tight text-muted-foreground mt-2">{book.author}</p>
          </div>

          {book.description && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 min-h-[4rem] text-left">
              {book.description}
            </p>
          )}
          
          <div className="w-6 h-px bg-border mx-auto"></div>
          
          <div className="flex flex-col items-center gap-3 pt-2">
            <span className="text-xl font-serif text-primary">
              R$ {book.price.toFixed(2).replace('.', ',')}
            </span>
            <Button 
              onClick={(event) => {
                event.stopPropagation()
                handleWhatsAppClick()
              }}
              variant="outline"
              className="w-full rounded-none border-border bg-transparent hover:bg-primary hover:text-primary-foreground hover:border-primary uppercase tracking-[0.2em] text-[10px] h-10 transition-colors duration-300"
            >
              Adquirir
            </Button>
          </div>
        </div>

      </article>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl italic pr-8">{book.title}</DialogTitle>
            <DialogDescription className="text-[11px] tracking-tight">
              {book.author}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className={`${conditionColors[book.condition]} border border-border/50 text-[10px] uppercase tracking-widest font-sans`}>
                {book.condition}
              </Badge>
              {book.genre && (
                <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-sans">
                  {book.genre}
                </Badge>
              )}
            </div>

            <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
              {book.description || 'Sem descricao cadastrada para este livro.'}
            </p>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xl font-serif text-primary">
                R$ {book.price.toFixed(2).replace('.', ',')}
              </span>
              <Button
                onClick={handleWhatsAppClick}
                className="rounded-none uppercase tracking-[0.2em] text-[10px]"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Adquirir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
