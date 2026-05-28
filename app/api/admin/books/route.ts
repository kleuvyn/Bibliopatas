import { randomUUID } from 'node:crypto'
import { desc } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { getDb } from '@/db'
import { books as booksTable } from '@/db/schema'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import type { BookFormData } from '@/lib/types'

function sanitizeNullableText(value: unknown) {
  const text = String(value || '').trim()
  return text.length > 0 ? text : null
}

function parseBookPayload(payload: Partial<BookFormData>) {
  const title = String(payload.title || '').trim()
  const author = String(payload.author || '').trim()
  const price = Number(payload.price || 0)

  if (!title || !author || !Number.isFinite(price) || price <= 0) {
    return null
  }

  const condition = payload.condition || 'seminovo'
  if (!['novo', 'seminovo', 'usado'].includes(condition)) {
    return null
  }

  return {
    title,
    author,
    price,
    cover_url: sanitizeNullableText(payload.cover_url),
    description: sanitizeNullableText(payload.description),
    condition,
    genre: sanitizeNullableText(payload.genre),
    available: payload.available ?? true,
  }
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })
  }

  try {
    const db = getDb()
    const books = await db.select().from(booksTable).orderBy(desc(booksTable.created_at))
    return NextResponse.json({ books })
  } catch (error) {
    return NextResponse.json(
      { error: 'Falha ao carregar livros. Verifique a configuração do banco.' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const payload = parseBookPayload(body)

    if (!payload) {
      return NextResponse.json({ error: 'Dados invalidos.' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const id = randomUUID()

    const db = getDb()
    const [book] = await db
      .insert(booksTable)
      .values({
        id,
        ...payload,
        created_at: now,
        updated_at: now,
      })
      .returning()

    return NextResponse.json({ book }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Falha ao criar livro.' }, { status: 500 })
  }
}
