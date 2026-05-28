import { createClient } from '@libsql/client'
import { getGoogleBooksCoverUrl } from '@/lib/google-books'
import { sampleBooks, type Book } from '@/lib/types'

async function enrichBooksWithCovers(books: Book[]) {
  if (!process.env.GOOGLE_BOOKS_API_KEY) {
    return books
  }

  return Promise.all(
    books.map(async (book) => {
      if (book.cover_url) return book

      const cover = await getGoogleBooksCoverUrl(book.title, book.author)

      return {
        ...book,
        cover_url: cover ?? null,
      }
    })
  )
}

export async function loadAvailableBooks() {
  try {
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      return enrichBooksWithCovers(sampleBooks)
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

    return enrichBooksWithCovers(books)
  } catch {
    return enrichBooksWithCovers(sampleBooks)
  }
}