const API_KEY = process.env.GOOGLE_BOOKS_API_KEY

function normalizeUrl(url: string | null | undefined) {
  if (!url) return null
  return url.replace(/^http:\/\//i, 'https://')
}

function upgradeGoogleBooksUrl(url: string | null | undefined) {
  const normalized = normalizeUrl(url)
  if (!normalized) return null

  try {
    const parsed = new URL(normalized)
    if (parsed.hostname.includes('books.google')) {
      parsed.searchParams.set('img', '1')
      parsed.searchParams.set('zoom', '5')
      parsed.searchParams.delete('edge')
      parsed.searchParams.delete('source')
      return parsed.toString()
    }
  } catch {
    return normalized
  }

  return normalized
}

function getBestCoverLink(imageLinks: any): string | null {
  if (!imageLinks || typeof imageLinks !== 'object') return null

  const candidates = [
    'extraLarge',
    'highResImageLink',
    'large',
    'medium',
    'thumbnail',
    'smallThumbnail',
  ]

  for (const key of candidates) {
    const value = imageLinks[key]
    if (typeof value === 'string' && value.trim()) {
      return upgradeGoogleBooksUrl(value)
    }
  }

  return null
}

function getCoverUrlFromVolume(volume: any): string | null {
  if (!volume || !volume.volumeInfo) return null
  return getBestCoverLink(volume.volumeInfo.imageLinks)
}

export async function getGoogleBooksCoverUrl(title: string, author?: string): Promise<string | null> {
  if (!API_KEY || !title) return null

  const queryText = [`intitle:${title}`]
  if (author) queryText.push(`inauthor:${author}`)

  const url = new URL('https://www.googleapis.com/books/v1/volumes')
  url.searchParams.set('q', queryText.join('+'))
  url.searchParams.set('key', API_KEY)
  url.searchParams.set('maxResults', '8')
  url.searchParams.set('langRestrict', 'pt')

  const response = await fetch(url.toString())
  if (!response.ok) return null

  const data = await response.json()
  if (!Array.isArray(data?.items)) return null

  for (const item of data.items) {
    const coverUrl = getCoverUrlFromVolume(item)
    if (coverUrl) return coverUrl
  }

  return null
}
