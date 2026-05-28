import { NextResponse } from 'next/server'
import { createClient } from '@libsql/client'
import { Book, sampleBooks } from '@/lib/types'

export async function GET() {
  try {
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      return NextResponse.json({ books: sampleBooks }, { status: 200 })
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

    return NextResponse.json({ books }, { status: 200, headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ books: sampleBooks }, { status: 200 })
  }
}
