import { desc } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { getDb } from '@/db'
import { books as booksTable } from '@/db/schema'
import { AdminDashboard } from '@/components/admin/dashboard'
import { sampleBooks } from '@/lib/types'
import { isAdminAuthenticated, getAdminEmail } from '@/lib/admin-auth'

async function getBooks() {
  try {
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      return sampleBooks
    }

    const db = getDb()
    return await db.select().from(booksTable).orderBy(booksTable.title)
  } catch {
    return sampleBooks
  }
}

async function checkAuth() {
  const isAuthenticated = await isAdminAuthenticated()
  if (!isAuthenticated) {
    return null
  }

  return { email: getAdminEmail() }
}

export default async function AdminPage() {
  const user = await checkAuth()
  
  if (!user) {
    redirect('/admin/login')
  }

  const books = await getBooks()

  return <AdminDashboard books={books} userEmail={user.email || ''} />
}
