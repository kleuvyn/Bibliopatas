import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { getDb } from '@/db'
import { books as booksTable } from '@/db/schema'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import type { Book, BookFormData } from '@/lib/types'

type BookPatch = Partial<BookFormData>

function sanitizeNullableText(value: unknown) {
  const text = String(value || '').trim()
  return text.length > 0 ? text : null
}

function buildUpdatePayload(payload: BookPatch) {
  const update: Partial<Book> = {
    updated_at: new Date().toISOString(),
  }

  if (payload.title !== undefined) {
    const title = String(payload.title).trim()
    if (!title) return null
    update.title = title
  }

  if (payload.author !== undefined) {
    const author = String(payload.author).trim()
    if (!author) return null
    update.author = author
  }

  if (payload.price !== undefined) {
    const price = Number(payload.price)
    if (!Number.isFinite(price) || price <= 0) return null
    update.price = price
  }

  if (payload.cover_url !== undefined) {
    update.cover_url = sanitizeNullableText(payload.cover_url)
  }

  if (payload.description !== undefined) {
    update.description = sanitizeNullableText(payload.description)
  }

  if (payload.genre !== undefined) {
    update.genre = sanitizeNullableText(payload.genre)
  }

  if (payload.condition !== undefined) {
    if (!['novo', 'seminovo', 'usado'].includes(payload.condition)) {
      return null
    }
    update.condition = payload.condition
  }

  if (payload.available !== undefined) {
    update.available = Boolean(payload.available)
  }

  return update
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = (await request.json()) as BookPatch
    const payload = buildUpdatePayload(body)

    if (!payload) {
      return NextResponse.json({ error: 'Dados invalidos.' }, { status: 400 })
    }

    const db = getDb()
    const [updated] = await db
      .update(booksTable)
      .set(payload)
      .where(eq(booksTable.id, id))
      .returning()

    if (!updated) {
      return NextResponse.json({ error: 'Livro nao encontrado.' }, { status: 404 })
    }

    return NextResponse.json({ book: updated })
  } catch {
    return NextResponse.json({ error: 'Falha ao atualizar livro.' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })
  }

  try {
    const { id } = await params

    const db = getDb()
    const [deleted] = await db
      .delete(booksTable)
      .where(eq(booksTable.id, id))
      .returning({ id: booksTable.id })

    if (!deleted) {
      return NextResponse.json({ error: 'Livro nao encontrado.' }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Falha ao excluir livro.' }, { status: 500 })
  }
}
