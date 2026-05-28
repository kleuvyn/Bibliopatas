export function normalizeCoverUrl(url: string | null | undefined) {
  if (!url) return null
  return url.replace(/^http:\/\//i, 'https://')
}

export function upgradeGoogleBooksCoverUrl(url: string | null | undefined) {
  const normalized = normalizeCoverUrl(url)
  if (!normalized) return null

  try {
    const parsed = new URL(normalized)
    if (!parsed.hostname.includes('books.google')) {
      return normalized
    }

    parsed.searchParams.set('img', '1')
    parsed.searchParams.set('zoom', '5')
    parsed.searchParams.delete('edge')
    parsed.searchParams.delete('source')

    return parsed.toString()
  } catch {
    return normalized
  }
}

export function isGoogleBooksCover(url: string | null | undefined) {
  const normalized = normalizeCoverUrl(url)
  if (!normalized) return false

  try {
    return new URL(normalized).hostname.includes('books.google')
  } catch {
    return false
  }
}