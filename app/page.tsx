import { createClient } from '@libsql/client'
import { sampleBooks, type Book } from '@/lib/types'
import { Header, Hero, Footer } from '@/components/layout'
import { BookGrid } from '@/components/book-grid'

const WHATSAPP_NUMBER = '556194293140'
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bibliopatas.com.br'

async function getBooks() {
  try {
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      return sampleBooks
    }

    const turso = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })

    const result = await turso.execute(`
      SELECT
        id,
        title,
        author,
        price,
        cover_url,
        description,
        condition,
        genre,
        available,
        created_at,
        updated_at
      FROM books
      WHERE available = 1
      ORDER BY lower(title) ASC
    `)

    const books: Book[] = result.rows.map((row) => ({
      id: String(row.id),
      title: String(row.title ?? ''),
      author: String(row.author ?? ''),
      price: Number(row.price ?? 0),
      cover_url: row.cover_url ? String(row.cover_url) : null,
      description: row.description ? String(row.description) : null,
      condition: (row.condition as Book['condition']) ?? 'usado',
      genre: row.genre ? String(row.genre) : null,
      available: Number(row.available ?? 0) === 1,
      created_at: String(row.created_at ?? ''),
      updated_at: String(row.updated_at ?? ''),
    }))

    return books
  } catch {
    // Se o Turso nao estiver configurado ou houver erro, usa dados locais
    return sampleBooks
  }
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'BookStore',
  name: 'Bibliopatas',
  description:
    'Bibliopatas reúne livros usados para apoiar protetores independentes e abrigos de animais em Brasília.',
  url: siteUrl,
  logo: `${siteUrl}/images/logo.png`,
  telephone: '+55 61 94293-140',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Brasília',
    addressRegion: 'DF',
    addressCountry: 'BR',
  },
}

export default async function HomePage() {
  const books = await getBooks()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Hero />

      <main className="flex-1 py-8 sm:py-12">
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-serif text-primary mb-3 italic">Nosso Acervo</h2>
            <p className="text-sm font-sans tracking-tight text-muted-foreground">
              Escolha seu próximo livro
            </p>
            <div className="w-12 h-px bg-border mx-auto mt-6"></div>
          </div>

          <BookGrid books={books} whatsappNumber={WHATSAPP_NUMBER} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
