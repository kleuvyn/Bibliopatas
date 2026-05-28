import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

function getExtensionFromFile(file: File) {
  const byName = file.name.split('.').pop()?.toLowerCase()
  if (byName && /^[a-z0-9]+$/.test(byName)) {
    return byName
  }

  const byMime = file.type.split('/').pop()?.toLowerCase()
  if (byMime && /^[a-z0-9]+$/.test(byMime)) {
    return byMime === 'jpeg' ? 'jpg' : byMime
  }

  return 'jpg'
}

async function uploadToBlob(file: File) {
  const token = process.env.bibliopatas_READ_WRITE_TOKEN || process.env.VERCEL_BLOB_TOKEN
  const storeId = process.env.bibliopatas_STORE_ID || process.env.VERCEL_BLOB_STORE_ID

  if (!token || !storeId) {
    return null
  }

  process.env.VERCEL_BLOB_TOKEN = token
  process.env.VERCEL_BLOB_STORE_ID = storeId

  const { put } = await import('@vercel/blob')
  const extension = getExtensionFromFile(file)
  const fileName = `${Date.now()}-${randomUUID()}.${extension}`
  const blobKey = `covers/${fileName}`
  const arrayBuffer = await file.arrayBuffer()
  const result = await put(blobKey, Buffer.from(arrayBuffer), { access: 'public' })

  return result?.url ?? null
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Arquivo não enviado.' }, { status: 400 })
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Envie apenas arquivos de imagem.' }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: 'Imagem muito grande. Limite de 5MB.' }, { status: 400 })
  }

  const blobUrl = await uploadToBlob(file)
  if (blobUrl) {
    return NextResponse.json({ url: blobUrl })
  }

  const extension = getExtensionFromFile(file)
  const fileName = `${Date.now()}-${randomUUID()}.${extension}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'covers')
  const filePath = path.join(uploadDir, fileName)

  await mkdir(uploadDir, { recursive: true })

  const arrayBuffer = await file.arrayBuffer()
  await writeFile(filePath, Buffer.from(arrayBuffer))

  return NextResponse.json({
    url: `/uploads/covers/${fileName}`,
  })
}
