'use client'

import { Book } from '@/lib/types'
import { BookCard } from './book-card'
import { useEffect, useState } from 'react'
import { Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface BookGridProps {
  books: Book[]
  whatsappNumber: string
}

function normalizeSearchText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

export function BookGrid({ books, whatsappNumber }: BookGridProps) {
  const [search, setSearch] = useState('')
  const [conditionFilter, setConditionFilter] = useState<string>('all')
  const [genreFilter, setGenreFilter] = useState<string>('all')
  const [priceOrder, setPriceOrder] = useState<string>('default')

  const [currentBooks, setCurrentBooks] = useState<Book[]>(books)

  const genres = [...new Set(
    currentBooks
      .map((book) => (book.genre ? book.genre.trim() : ''))
      .filter((genre) => genre.length > 0)
  )].sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }))

  const filteredBooks = currentBooks.filter(book => {
    if (!book.available) return false
    const normalizedGenre = book.genre ? book.genre.trim() : ''
    const query = normalizeSearchText(search)
    const haystack = normalizeSearchText(
      [book.title, book.author, book.description ?? '', book.genre ?? ''].join(' ')
    )
    
    const matchesSearch = !query || query.split(' ').every((term) => haystack.includes(term))
    
    const matchesCondition = 
      conditionFilter === 'all' || book.condition === conditionFilter
    
    const matchesGenre = 
      genreFilter === 'all' || normalizedGenre === genreFilter

    return matchesSearch && matchesCondition && matchesGenre
  })

  const sortedBooks = [...filteredBooks]
  if (priceOrder === 'low-high') {
    sortedBooks.sort((a, b) => a.price - b.price)
  } else if (priceOrder === 'high-low') {
    sortedBooks.sort((a, b) => b.price - a.price)
  }

  useEffect(() => {
    let active = true

    const loadBooks = async () => {
      try {
        const response = await fetch('/api/books/list', { cache: 'no-store' })
        if (!response.ok) return
        const data = await response.json() as { books: Book[] }
        if (active && Array.isArray(data.books)) {
          setCurrentBooks(data.books)
        }
      } catch {
        // manter o estado atual em caso de erro.
      }
    }

    void loadBooks()
    const intervalId = setInterval(loadBooks, 30000)

    return () => {
      active = false
      clearInterval(intervalId)
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-border/70 bg-card/80 p-4 shadow-sm">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, autor ou descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setSearch('')
              }
            }}
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="search"
            className="pl-10 pr-10"
          />
          {search ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setSearch('')}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Limpar busca"
              title="Limpar busca"
            >
              <span className="text-lg leading-none">×</span>
            </Button>
          ) : null}
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          <Select value={conditionFilter} onValueChange={setConditionFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Condicao" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="novo">Novo</SelectItem>
              <SelectItem value="seminovo">Seminovo</SelectItem>
              <SelectItem value="usado">Usado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priceOrder} onValueChange={setPriceOrder}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Preço" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Sem ordem</SelectItem>
              <SelectItem value="low-high">Menor maior</SelectItem>
              <SelectItem value="high-low">Maior menor</SelectItem>
            </SelectContent>
          </Select>
          {genres.length > 0 && (
            <Select value={genreFilter} onValueChange={setGenreFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Genero" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {genres.map(genre => (
                  <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {filteredBooks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum livro encontrado.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {filteredBooks.length} {filteredBooks.length === 1 ? 'livro encontrado' : 'livros encontrados'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedBooks.map((book) => (
              <BookCard key={book.id} book={book} whatsappNumber={whatsappNumber} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
