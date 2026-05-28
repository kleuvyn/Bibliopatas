import { NextResponse } from 'next/server'
import { createClient } from '@libsql/client'
import { sampleBooks } from '@/lib/types'

function getFallbackStats() {
  const total = sampleBooks.length
  const available = sampleBooks.filter((book) => book.available).length
  return {
    total,
    available,
    sold: total - available,
  }
}

export async function GET() {
  try {
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      return NextResponse.json(getFallbackStats(), { status: 200 })
    }

    const turso = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })

    const result = await turso.execute(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN available = 1 THEN 1 ELSE 0 END) AS available
      FROM books
    `)

    const row = result.rows[0] ?? {}
    const total = Number(row.total ?? 0)
    const available = Number(row.available ?? 0)

    return NextResponse.json(
      {
        total,
        available,
        sold: Math.max(total - available, 0),
      },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    )
  } catch {
    return NextResponse.json(getFallbackStats(), { status: 200 })
  }
}
