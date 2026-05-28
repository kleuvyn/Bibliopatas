import { loadAvailableBooks } from '@/lib/books'
import { Header, Hero, Footer } from '@/components/layout'
import { BookGrid } from '@/components/book-grid'

const WHATSAPP_NUMBER = '556194293140'
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bibliopatas.com.br'

async function getBooks() {
  return loadAvailableBooks()
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
