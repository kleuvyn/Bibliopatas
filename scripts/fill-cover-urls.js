require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@libsql/client')

const API_KEY = process.env.GOOGLE_BOOKS_API_KEY
if (!API_KEY) {
  console.error('ERRO: GOOGLE_BOOKS_API_KEY não encontrado em .env.local')
  process.exit(1)
}

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

function sanitizeQuery(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/"/g, '')
}

function normalizeUrl(url) {
  if (!url) return url
  return url.replace(/^http:\/\//i, 'https://')
}

async function fetchCoverUrl(title, author) {
  const titleQuery = sanitizeQuery(title)
  const authorQuery = sanitizeQuery(author)
  const queries = [
    { query: `intitle:"${titleQuery}"+inauthor:"${authorQuery}"`, langRestrict: 'pt' },
    { query: `${titleQuery}+${authorQuery}`, langRestrict: 'pt' },
    { query: `intitle:"${titleQuery}"`, langRestrict: 'pt' },
    { query: `${titleQuery}`, langRestrict: 'pt' },
    { query: `intitle:"${titleQuery}"+inauthor:"${authorQuery}"`, langRestrict: undefined },
    { query: `${titleQuery}+${authorQuery}`, langRestrict: undefined },
    { query: `intitle:"${titleQuery}"`, langRestrict: undefined },
    { query: `${titleQuery}`, langRestrict: undefined },
  ]

  for (const item of queries) {
    const query = item.query
    const langRestrict = item.langRestrict
    let url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${API_KEY}&maxResults=5`
    if (langRestrict) {
      url += `&langRestrict=${langRestrict}`
    }
    try {
      const response = await fetch(url)
      if (!response.ok) {
        if (response.status === 429) {
          console.warn('Google Books rate limit, aguardando 2s...')
          await new Promise((resolve) => setTimeout(resolve, 2000))
          continue
        }
        console.warn(`Google Books retornou ${response.status} para query: ${query}`)
        continue
      }

      const data = await response.json()
      if (!data.items || !Array.isArray(data.items)) continue

      for (const item of data.items) {
        const imageLinks = item?.volumeInfo?.imageLinks
        const thumb = imageLinks?.thumbnail || imageLinks?.smallThumbnail || imageLinks?.large || imageLinks?.medium
        if (typeof thumb === 'string' && thumb.length > 0) {
          return normalizeUrl(thumb)
        }
      }
    } catch (error) {
      console.warn('Erro ao buscar capa:', error?.message || error)
    }

    await new Promise((resolve) => setTimeout(resolve, 250))
  }

  return null
}

async function run() {
  const result = await turso.execute(
    "SELECT id, title, author FROM books WHERE cover_url IS NULL OR trim(cover_url) = ''"
  )

  const books = result.rows
  console.log(`Encontrados ${books.length} livros sem capa.`)
  let updated = 0
  let failed = 0

  for (let i = 0; i < books.length; i += 1) {
    const book = books[i]
    const title = String(book.title || '')
    const author = String(book.author || '')
    const coverUrl = await fetchCoverUrl(title, author)

    if (coverUrl) {
      await turso.execute({
        sql: 'UPDATE books SET cover_url = ? WHERE id = ?',
        args: [coverUrl, book.id],
      })
      console.log(`[${i + 1}/${books.length}] ${title} — capa encontrada`)
      updated += 1
    } else {
      console.log(`[${i + 1}/${books.length}] ${title} — sem capa encontrada`)
      failed += 1
    }

    await new Promise((resolve) => setTimeout(resolve, 250))
  }

  console.log(`Concluído. Atualizados: ${updated}. Falhas: ${failed}.`)
}

run().catch((error) => {
  console.error('Erro inesperado:', error)
  process.exit(1)
})
