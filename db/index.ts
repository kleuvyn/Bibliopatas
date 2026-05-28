import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"

export function getDb() {
  const url = process.env.TURSO_DATABASE_URL
  if (!url) {
    throw new Error('TURSO_DATABASE_URL is required to access the database')
  }

  const client = createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })

  return drizzle(client)
}
