import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'

const API_KEY = process.env.GOOGLE_BOOKS_API_KEY

type CoverOption = {
  cover_url: string
  title: string
  authors: string
}

function normalizeUrl(url: string | null | undefined) {
  if (!url) return null
  return url.replace(/^http:\/\//i, 'https://')
}

function upgradeGoogleBooksUrl(url: string) {
  const normalized = normalizeUrl(url)
  if (!normalized) return normalized

  try {
    const parsed = new URL(normalized)
    if (parsed.hostname.includes('books.google')) {
      parsed.searchParams.set('img', '1')
      parsed.searchParams.set('zoom', '5')
      parsed.searchParams.delete('edge')
      return parsed.toString()
    }
  } catch {
    // Mantem a URL original quando nao for possivel reescrever.
  }

  return normalized
}

function getCoverOptionFromVolume(volume: any): CoverOption | null {
  const imageLinks = volume?.volumeInfo?.imageLinks
  const rawUrl =
    imageLinks?.extraLarge ||
    imageLinks?.highResImageLink ||
    imageLinks?.large ||
    imageLinks?.medium ||
    imageLinks?.thumbnail ||
    imageLinks?.smallThumbnail

  const cover_url = rawUrl ? upgradeGoogleBooksUrl(rawUrl) : null
  if (!cover_url) return null

  const title = String(volume?.volumeInfo?.title || '').trim() || 'Título desconhecido'
  const authorsList = Array.isArray(volume?.volumeInfo?.authors)
    ? volume.volumeInfo.authors.filter((author: unknown) => typeof author === 'string')
    : []
  const authors = authorsList.length > 0 ? authorsList.join(', ') : 'Autor desconhecido'

  return {
    cover_url,
    title,
    authors,
  }
}

async function fetchFromGoogleBooks(query: string, langRestrict?: string): Promise<CoverOption[]> {
  const url = new URL('https://www.googleapis.com/books/v1/volumes')
  url.searchParams.set('q', query)
  url.searchParams.set('key', API_KEY ?? '')
  url.searchParams.set('maxResults', '20')
  if (langRestrict) {
    url.searchParams.set('langRestrict', langRestrict)
  }

  const response = await fetch(url.toString())
  if (!response.ok) return []

  const data = await response.json()
  if (!data?.items || !Array.isArray(data.items)) return []

  const options: CoverOption[] = (data.items as any[])
    .map(getCoverOptionFromVolume)
    .filter((option): option is CoverOption => option !== null)

  return options
}

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  if (!API_KEY) {
    return NextResponse.json({ error: 'Google Books API key não configurada.' }, { status: 500 })
  }

  const url = new URL(request.url)
  const directQuery = String(url.searchParams.get('query') || '').trim()
  const title = String(url.searchParams.get('title') || '').trim()
  const author = String(url.searchParams.get('author') || '').trim()

  if (!title && !directQuery) {
    return NextResponse.json({ error: 'Título obrigatório.' }, { status: 400 })
  }

  const queries = directQuery
    ? [directQuery, `intitle:"${directQuery}"`]
    : [
        `intitle:"${title}"${author ? `+inauthor:"${author}"` : ''}`,
        `${title}${author ? `+${author}` : ''}`,
        `intitle:"${title}"`,
        `${title}`,
      ]

  const coverMap = new Map<string, CoverOption>()

  for (const query of queries) {
    const options = await fetchFromGoogleBooks(query, 'pt')
    options.forEach((option) => {
      if (!coverMap.has(option.cover_url)) {
        coverMap.set(option.cover_url, option)
      }
    })
  }

  if (coverMap.size === 0) {
    for (const query of queries) {
      const options = await fetchFromGoogleBooks(query)
      options.forEach((option) => {
        if (!coverMap.has(option.cover_url)) {
          coverMap.set(option.cover_url, option)
        }
      })
    }
  }

  const coverOptions = Array.from(coverMap.values()).slice(0, 20)

  if (coverOptions.length === 0) {
    return NextResponse.json({ error: 'Capa não encontrada.' }, { status: 404 })
  }

  return NextResponse.json({
    cover_options: coverOptions,
    cover_urls: coverOptions.map((option) => option.cover_url),
  })
}
