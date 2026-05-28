'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Book, BookFormData } from '@/lib/types'
import { GENRE_OPTIONS } from '@/lib/genres'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Plus, 
  Pencil, 
  Trash2, 
  LogOut, 
  BookOpen,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  Save,
  X,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { isBlobCoverUrl, isGoogleBooksCover, upgradeGoogleBooksCoverUrl } from '@/lib/cover'

interface AdminDashboardProps {
  books: Book[]
  userEmail: string
}

type GoogleCoverOption = {
  cover_url: string
  title: string
  authors: string
}

function normalizeSearchText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

const emptyBook: BookFormData = {
  title: '',
  author: '',
  price: 0,
  cover_url: null,
  description: null,
  condition: 'seminovo',
  genre: null,
  available: true,
}

export function AdminDashboard({ books: initialBooks, userEmail }: AdminDashboardProps) {
  const [books, setBooks] = useState<Book[]>(initialBooks)
  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [formData, setFormData] = useState<BookFormData>(emptyBook)
  const [loading, setLoading] = useState(false)
  const [fetchingCover, setFetchingCover] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [googleCoverOptions, setGoogleCoverOptions] = useState<GoogleCoverOption[]>([])
  const [googleCoverError, setGoogleCoverError] = useState('')
  const [coverSearchTerm, setCoverSearchTerm] = useState('')
  const router = useRouter()

  const getApiError = async (response: Response, fallback: string) => {
    try {
      const data = await response.json()
      return String(data?.error || fallback)
    } catch {
      return fallback
    }
  }

  const fetchCoverFromGoogleBooks = async () => {
    const queryText = normalizeSearchText(
      coverSearchTerm.trim() || `${formData.title} ${formData.author || ''}`.trim()
    )

    if (!queryText) {
      alert('Digite um título ou autor para buscar capas.')
      return
    }

    setFetchingCover(true)
    setGoogleCoverError('')
    setGoogleCoverOptions([])

    try {
      const query = new URLSearchParams()
      query.set('query', queryText)
      query.set('title', formData.title)
      query.set('author', formData.author || '')

      const response = await fetch(`/api/admin/google-books-cover?${query.toString()}`)
      if (!response.ok) {
        const data = await response.json().catch(() => null)
        const message = data?.error || 'Não foi possível encontrar capas.'
        setGoogleCoverError(message)
        return
      }

      const data = await response.json()
      const options = Array.isArray(data?.cover_options)
        ? data.cover_options
        : Array.isArray(data?.cover_urls)
          ? data.cover_urls.map((url: string) => ({
              cover_url: url,
              title: 'Capa encontrada',
              authors: formData.author || 'Autor não informado',
            }))
          : []

      if (options.length > 0) {
        setGoogleCoverOptions(options)
        setGoogleCoverError('')
      } else {
        setGoogleCoverError('Nenhuma capa encontrada.')
      }
    } catch (error) {
      console.error('Erro ao buscar capa:', error)
      setGoogleCoverError('Falha ao buscar capas. Tente novamente.')
    } finally {
      setFetchingCover(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setGoogleCoverError('Arquivo inválido. Envie uma imagem.')
      e.target.value = ''
      return
    }

    const uploadCover = async () => {
      try {
        setUploadingCover(true)
        setGoogleCoverError('')

        const payload = new FormData()
        payload.append('file', file)

        const response = await fetch('/api/admin/upload-cover', {
          method: 'POST',
          body: payload,
        })

        const data = await response.json().catch(() => null)
        if (!response.ok) {
          throw new Error(data?.error || 'Falha ao enviar imagem.')
        }

        if (!data?.url) {
          throw new Error('Upload concluído sem URL retornada.')
        }

        setFormData((prev) => ({ ...prev, cover_url: data.url }))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro no upload da capa.'
        setGoogleCoverError(message)
      } finally {
        setUploadingCover(false)
        e.target.value = ''
      }
    }

    void uploadCover()
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  const openNewBookDialog = () => {
    setEditingBook(null)
    setFormData(emptyBook)
    setCoverSearchTerm('')
    setGoogleCoverOptions([])
    setGoogleCoverError('')
    setIsDialogOpen(true)
  }

  const openEditDialog = (book: Book) => {
    setEditingBook(book)
    setFormData({
      title: book.title,
      author: book.author,
      price: book.price,
      cover_url: book.cover_url,
      description: book.description,
      condition: book.condition,
      genre: book.genre,
      available: book.available,
    })
    setCoverSearchTerm(`${book.title} ${book.author}`)
    setGoogleCoverOptions([])
    setGoogleCoverError('')
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.title || !formData.author || formData.price <= 0) {
      alert('Preencha titulo, autor e preco')
      return
    }

    setLoading(true)

    try {
      if (editingBook) {
        const response = await fetch(`/api/admin/books/${editingBook.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          throw new Error(await getApiError(response, 'Erro ao atualizar livro.'))
        }

        const { book } = await response.json()
        setBooks((prev) => prev.map((b) => (b.id === editingBook.id ? book : b)))
      } else {
        const response = await fetch('/api/admin/books', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          throw new Error(await getApiError(response, 'Erro ao criar livro.'))
        }

        const { book } = await response.json()
        setBooks((prev) => [book, ...prev])
      }

      setIsDialogOpen(false)
      setFormData(emptyBook)
      setEditingBook(null)
    } catch (error: unknown) {
      console.error('Erro ao salvar:', error)
      const message = error instanceof Error ? error.message : 'Erro ao salvar livro.'
      alert(message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (bookId: string) => {
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/books/${bookId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(await getApiError(response, 'Erro ao excluir livro.'))
      }

      setBooks((prev) => prev.filter((b) => b.id !== bookId))
    } catch (error: unknown) {
      console.error('Erro ao deletar:', error)
      const message = error instanceof Error ? error.message : 'Erro ao excluir livro.'
      alert(message)
    } finally {
      setLoading(false)
    }
  }

  const toggleAvailability = async (book: Book) => {
    try {
      const response = await fetch(`/api/admin/books/${book.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ available: !book.available }),
      })

      if (!response.ok) {
        throw new Error(await getApiError(response, 'Erro ao atualizar disponibilidade.'))
      }

      const { book: updatedBook } = await response.json()
      setBooks((prev) => prev.map((item) => (item.id === updatedBook.id ? updatedBook : item)))
    } catch (error: unknown) {
      console.error('Erro ao atualizar:', error)
    }
  }

  const availableCount = books.filter(b => b.available).length
  const soldCount = books.filter(b => !b.available).length
  const sortedBooks = [...books].sort((a, b) =>
    a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' })
  )
  const filteredBooks = sortedBooks.filter((book) => {
    const query = normalizeSearchText(search)
    if (!query) return true

    const tokens = query.split(' ').filter(Boolean)

    const haystack = normalizeSearchText(
      [book.title, book.author, book.genre ?? '', String(book.price)]
        .join(' ')
    )

    return tokens.every((token) => haystack.includes(token))
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Image
                  src="/images/logo.png"
                  alt="Bibliopatas"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </Link>
              <div>
                <h1 className="font-bold text-foreground">Painel Admin</h1>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/" target="_blank" rel="noopener noreferrer" className="gap-2 inline-flex items-center justify-center">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Abrir Catálogo</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total de Livros</CardDescription>
              <CardTitle className="text-3xl">{books.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Disponiveis</CardDescription>
              <CardTitle className="text-3xl text-green-600">{availableCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Vendidos</CardDescription>
              <CardTitle className="text-3xl text-muted-foreground">{soldCount}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold">Gerenciar Livros</h2>
            <p className="text-sm text-muted-foreground">{filteredBooks.length} {filteredBooks.length === 1 ? 'livro' : 'livros'} encontrados</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center w-full md:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar titulo, autor ou genero"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setSearch('')
                  }
                }}
                className="pl-10 pr-10"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Limpar busca"
                  title="Limpar busca"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : null}
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openNewBookDialog} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Adicionar Livro
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingBook ? 'Editar Livro' : 'Novo Livro'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingBook ? 'Atualize as informacoes do livro' : 'Adicione um novo livro ao catalogo'}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titulo *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Nome do livro"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="author">Autor *</Label>
                    <Input
                      id="author"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="Nome do autor"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Preco (R$) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        placeholder="25.00"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="condition">Condicao</Label>
                      <Select 
                        value={formData.condition} 
                        onValueChange={(value: 'novo' | 'seminovo' | 'usado') => setFormData({ ...formData, condition: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="novo">Novo</SelectItem>
                          <SelectItem value="seminovo">Seminovo</SelectItem>
                          <SelectItem value="usado">Usado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="genre">Genero</Label>
                    <Select
                      value={formData.genre || ''}
                      onValueChange={(value) => setFormData({ ...formData, genre: value || null })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um gênero" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENRE_OPTIONS.map((genre) => (
                          <SelectItem key={genre} value={genre}>
                            {genre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Use o mesmo padrão de gêneros do filtro do catálogo.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cover_url">URL da Capa ou Upload</Label>
                    <div className="flex gap-2">
                      <Input
                        id="cover_url"
                        value={formData.cover_url || ''}
                        onChange={(e) => setFormData({ ...formData, cover_url: e.target.value || null })}
                        placeholder="https://exemplo.com/capa.jpg"
                      />
                      <input
                        id="cover-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Label
                        htmlFor="cover-upload"
                        className={`inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ${uploadingCover ? 'pointer-events-none opacity-70' : 'cursor-pointer'}`}
                      >
                        {uploadingCover ? 'Enviando...' : 'Upload'}
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">Aceita JPG, PNG e WEBP.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="cover-search">Buscar no Google Books</Label>
                      <Input
                        id="cover-search"
                        value={coverSearchTerm}
                        onChange={(e) => setCoverSearchTerm(e.target.value)}
                        placeholder="Ex.: Dom Casmurro Machado de Assis"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label className="invisible">Buscar capas</Label>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={fetchCoverFromGoogleBooks}
                        disabled={fetchingCover || (!coverSearchTerm.trim() && !formData.title.trim())}
                      >
                        {fetchingCover ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          'Buscar capas'
                        )}
                      </Button>
                    </div>
                  </div>

                  {googleCoverError ? (
                    <p className="text-sm text-destructive">{googleCoverError}</p>
                  ) : null}

                  {googleCoverOptions.length > 0 && (
                    <div className="space-y-2">
                      <Label>Capas do Google Books</Label>
                      <p className="text-xs text-muted-foreground">Role a lista e clique na capa que deseja usar.</p>
                      <div className="flex flex-col gap-2 max-h-[24rem] overflow-y-auto pr-1">
                        {googleCoverOptions.map((option) => {
                          const selected = formData.cover_url === option.cover_url
                          return (
                            <button
                              key={`${option.cover_url}-${option.title}`}
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, cover_url: option.cover_url }))}
                              className={`w-full rounded-xl border p-2 text-left transition ${selected ? 'border-primary ring-2 ring-primary/30 bg-primary/5' : 'border-border'} focus:outline-none focus:ring-2 focus:ring-primary/50`}
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={option.cover_url}
                                  alt={`Capa de ${option.title}`}
                                  className="h-24 w-16 rounded object-cover bg-muted flex-none"
                                />
                                <div className="min-w-0">
                                  <p className="text-sm font-medium line-clamp-2">{option.title}</p>
                                  <p className="text-xs text-muted-foreground line-clamp-2">{option.authors}</p>
                                </div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="description">Descricao</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value || null })}
                      placeholder="Breve descricao do livro..."
                      rows={3}
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Salvar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Book List */}
        {filteredBooks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum livro cadastrado ainda</p>
              <Button onClick={openNewBookDialog} className="mt-4">
                Adicionar primeiro livro
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredBooks.map((book) => (
              <Card key={book.id} className={!book.available ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-20 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                      {book.cover_url ? (
                        <Image
                          src={upgradeGoogleBooksCoverUrl(book.cover_url) || book.cover_url}
                          alt={book.title}
                          width={64}
                          height={80}
                          className="w-full h-full object-cover"
                          quality={100}
                          unoptimized={isGoogleBooksCover(book.cover_url) || isBlobCoverUrl(book.cover_url)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-foreground line-clamp-1">{book.title}</h3>
                          <p className="text-sm text-muted-foreground">{book.author}</p>
                        </div>
                        <span className="font-bold text-primary whitespace-nowrap">
                          R$ {book.price.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={book.available ? 'default' : 'secondary'}>
                          {book.available ? 'Disponivel' : 'Vendido'}
                        </Badge>
                        <Badge variant="outline">{book.condition}</Badge>
                        {book.genre && <Badge variant="outline">{book.genre}</Badge>}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleAvailability(book)}
                        title={book.available ? 'Marcar como vendido' : 'Marcar como disponivel'}
                      >
                        {book.available ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(book)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir livro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir &quot;{book.title}&quot;? Esta acao nao pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(book.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
