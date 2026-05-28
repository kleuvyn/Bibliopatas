require('dotenv').config({ path: '.env.local' })
const { randomUUID } = require('node:crypto')
const { createClient } = require('@libsql/client')

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

function normalizeKey(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const booksToUpsert = [
  {
    title: 'Dublinenses',
    author: 'James Joyce',
    price: 20,
    condition: 'seminovo',
    genre: 'Ficção e Literatura',
    description:
      'Coletânea de contos de James Joyce que retrata a vida cotidiana, a paralisia moral e as frustrações da Dublin do início do século XX.',
  },
  {
    title: 'Histórias de Amor',
    author: 'Rubem Fonseca',
    price: 12,
    condition: 'usado',
    genre: 'Ficção e Literatura',
    description:
      'Coletânea de contos de Rubem Fonseca sobre desejo, violência, ironia e relações humanas intensas.',
  },
  {
    title: 'Histórias Primordiais',
    author: 'Edgar Allan Poe',
    price: 15,
    condition: 'seminovo',
    genre: 'Ficção e Literatura',
    description:
      'Seleção de contos de Edgar Allan Poe marcada pelo gótico, suspense, mistério e psicologia do medo.',
  },
  {
    title: 'O Faroleiro e outros contos',
    author: 'Henryk Sienkiewicz',
    price: 14,
    condition: 'usado',
    genre: 'Ficção e Literatura',
    description:
      'Conjunto de contos de Henryk Sienkiewicz com atmosfera humana, narrativa clássica e forte atenção aos dilemas do cotidiano.',
  },
  {
    title: 'O Livro de Areia',
    author: 'Jorge Luis Borges',
    price: 20,
    condition: 'seminovo',
    genre: 'Ficção e Literatura',
    description:
      'Coletânea de contos de Jorge Luis Borges que explora infinito, tempo, labirintos, espelhos e realidade.',
  },
  {
    title: 'Casa de Bonecas',
    author: 'Henrik Ibsen',
    price: 10,
    condition: 'seminovo',
    genre: 'Ficção e Literatura',
    description:
      'Drama teatral de Henrik Ibsen sobre liberdade pessoal, casamento e a emancipação feminina na sociedade burguesa.',
  },
  {
    title: 'Cyrano de Bergerac',
    author: 'Edmond Rostand',
    price: 10,
    condition: 'seminovo',
    genre: 'Ficção e Literatura',
    description:
      'Peça romântica e poética de Edmond Rostand sobre amor, honra e coragem, contada pelo herói de nariz notável Cyrano.',
  },
  {
    title: 'Obras selectas',
    author: 'Arthur Conan Doyle',
    price: 20,
    condition: 'usado',
    genre: 'Ficção e Literatura',
    description:
      'Seleção em espanhol de textos de Arthur Conan Doyle com histórias de mistério, aventura e investigação.',
  },
]

async function run() {
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    throw new Error('Variaveis do Turso nao encontradas no .env.local')
  }

  const result = await turso.execute('SELECT id, title, author FROM books')
  const existingByKey = new Map(
    result.rows.map((row) => [
      `${normalizeKey(row.title)}|||${normalizeKey(row.author)}`,
      String(row.id),
    ]),
  )

  let inserted = 0
  let updated = 0

  for (const book of booksToUpsert) {
    const key = `${normalizeKey(book.title)}|||${normalizeKey(book.author)}`
    const now = new Date().toISOString()
    const existingId = existingByKey.get(key)

    if (existingId) {
      await turso.execute({
        sql: `
          UPDATE books
          SET price = ?,
              description = ?,
              condition = ?,
              genre = ?,
              available = 1,
              updated_at = ?
          WHERE id = ?
        `,
        args: [book.price, book.description, book.condition, book.genre, now, existingId],
      })
      updated += 1
      continue
    }

    await turso.execute({
      sql: `
        INSERT INTO books (
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
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        randomUUID(),
        book.title,
        book.author,
        book.price,
        null,
        book.description,
        book.condition,
        book.genre,
        1,
        now,
        now,
      ],
    })
    inserted += 1
  }

  console.log(`Concluido. Inseridos: ${inserted}. Atualizados: ${updated}.`)
}

run().catch((error) => {
  console.error('Erro ao adicionar livros:', error)
  process.exit(1)
})
