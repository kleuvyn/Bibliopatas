require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@libsql/client')

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

function normalizeUrl(url) {
  if (!url) return null
  return String(url).replace(/^http:\/\//i, 'https://')
}

function upgradeGoogleBooksUrl(url) {
  const normalized = normalizeUrl(url)
  if (!normalized) return null

  try {
    const parsed = new URL(normalized)
    if (parsed.hostname.includes('books.google')) {
      parsed.searchParams.set('img', '1')
      parsed.searchParams.set('zoom', '5')
      parsed.searchParams.delete('edge')
      return parsed.toString()
    }
  } catch {
    return normalized
  }

  return normalized
}

async function run() {
  const result = await turso.execute(`
    SELECT id, title, cover_url
    FROM books
    WHERE cover_url IS NOT NULL
      AND (
        cover_url LIKE '%books.google.%'
        OR cover_url LIKE '%zoom=1%'
        OR cover_url LIKE '%zoom=2%'
        OR cover_url LIKE '%smallThumbnail%'
        OR cover_url LIKE '%thumbnail%'
      )
  `)

  let updated = 0

  for (const row of result.rows) {
    const nextUrl = upgradeGoogleBooksUrl(row.cover_url)
    if (!nextUrl || nextUrl === row.cover_url) continue

    await turso.execute({
      sql: 'UPDATE books SET cover_url = ?, updated_at = ? WHERE id = ?',
      args: [nextUrl, new Date().toISOString(), row.id],
    })
    updated += 1
    console.log(`Atualizada capa: ${row.title}`)
  }

  console.log(`Concluido. Capas atualizadas: ${updated}.`)
}

run().catch((error) => {
  console.error('Erro ao atualizar capas:', error)
  process.exit(1)
})
