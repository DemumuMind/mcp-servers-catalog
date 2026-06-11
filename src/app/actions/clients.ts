'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db, clients } from '@/lib/db'
import { eq, and, or, like, asc, inArray } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth-guard'
import { logAudit } from './audit-log'

const clientSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  url: z.string().url(),
  icon: z.string().optional(),
  featured: z.boolean().default(false),
})

export async function getClients(filters?: {
  featured?: boolean
  search?: string
}) {
  const conditions = []

  if (filters?.featured !== undefined) {
    conditions.push(eq(clients.featured, filters.featured))
  }
  if (filters?.search) {
    conditions.push(
      or(
        like(clients.name, `%${filters.search}%`),
        like(clients.description, `%${filters.search}%`),
      )
    )
  }

  return db
    .select()
    .from(clients)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(clients.name))
}

export async function getClientById(id: string) {
  const result = await db
    .select()
    .from(clients)
    .where(eq(clients.id, id))
    .limit(1)
  return result[0] || null
}

export async function createClient(data: z.infer<typeof clientSchema>) {
  const userId = await requireAdmin()
  const validated = clientSchema.parse(data)
  const [client] = await db
    .insert(clients)
    .values(validated)
    .returning()
  try { await logAudit('client.create', 'Client', client.id, { name: client.name }, userId) } catch { /* audit log failure — non-critical */ }
  revalidatePath('/', 'layout')
  return client
}

export async function updateClient(id: string, data: z.infer<typeof clientSchema>) {
  const userId = await requireAdmin()
  const validated = clientSchema.parse(data)
  const [client] = await db
    .update(clients)
    .set(validated)
    .where(eq(clients.id, id))
    .returning()
  try { await logAudit('client.update', 'Client', id, { name: client.name }, userId) } catch { /* audit log failure — non-critical */ }
  revalidatePath('/', 'layout')
  return client
}

export async function deleteClient(id: string) {
  const userId = await requireAdmin()
  await db.delete(clients).where(eq(clients.id, id))
  try { await logAudit('client.delete', 'Client', id, undefined, userId) } catch { /* audit log failure — non-critical */ }
  revalidatePath('/', 'layout')
}

export async function deleteClients(ids: string[]) {
  const userId = await requireAdmin()
  await db.delete(clients).where(inArray(clients.id, ids))
  try { await logAudit('client.bulk_delete', 'Client', undefined, { count: ids.length }, userId) } catch { /* audit log failure — non-critical */ }
  revalidatePath('/', 'layout')
  revalidatePath('/admin/clients')
}
