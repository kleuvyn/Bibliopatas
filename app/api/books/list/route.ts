import { NextResponse } from 'next/server'
import { loadAvailableBooks } from '@/lib/books'

export async function GET() {
  try {
    const books = await loadAvailableBooks()

    return NextResponse.json({ books }, { status: 200, headers: { 'Cache-Control': 'no-store' } })
  } catch {
    const books = await loadAvailableBooks()
    return NextResponse.json({ books }, { status: 200, headers: { 'Cache-Control': 'no-store' } })
  }
}
