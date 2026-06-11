'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db, servers, ratings } from '@/lib/db'
import { eq, and, or, like, desc, count, avg, inArray } from 'drizzle-orm'
import { triggerWebhooks } from './webhooks'
import { delCachePattern } from '@/lib/cache'
import { logAudit } from './audit-log'
import { requireAdmin } from '@/lib/auth-guard'

const serverSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  owner: z.string().min(1),
  repo: z.string().min(1),
  category: z.string().min(1),
  isOfficial: z.boolean().default(false),
  isSponsored: z.boolean().default(false),
  githubUrl: z.string().url(),
  tags: z.array(z.string()).default([]),
  isRemote: z.boolean().default(false),
  authType: z.string().optional(),
  endpoint: z.string().optional(),
  featured: z.boolean().default(false),
})

function buildServerPayload(server: { id: string; name: string; owner: string; repo: string; category: string }) {
  return { id: server.id, name: server.name, owner: server.owner, repo: server.repo, category: server.category }
}

export async function getServers(filters?: {
  category?: string
  isOfficial?: boolean
  isRemote?: boolean
  featured?: boolean
  search?: string
}) {
  const conditions = []

  if (filters?.category && filters.category !== 'all') {
    conditions.push(eq(servers.category, filters.category))
  }
  if (filters?.isOfficial !== undefined) {
    conditions.push(eq(servers.isOfficial, filters.isOfficial))
  }
  if (filters?.isRemote !== undefined) {
    conditions.push(eq(servers.isRemote, filters.isRemote))
  }
  if (filters?.featured !== undefined) {
    conditions.push(eq(servers.featured, filters.featured))
  }
  if (filters?.search) {
    conditions.push(
      or(
        like(servers.name, `%${filters.search}%`),
        like(servers.description, `%${filters.search}%`),
      )
    )
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const serverRows = await db.select().from(servers).where(whereClause).orderBy(desc(servers.createdAt))

  const serverIds = serverRows.map((s: any) => s.id)
  const ratingsAgg = serverIds.length > 0
    ? await db.select({
        serverId: ratings.serverId,
        avg: avg(ratings.value),
        count: count(),
      }).from(ratings).where(inArray(ratings.serverId, serverIds)).groupBy(ratings.serverId)
    : []

  const ratingMap: Map<number, { avg: number | null; count: number }> = new Map(ratingsAgg.map((r: any) => [r.serverId, { avg: r.avg, count: r.count }]))

  return serverRows.map((server: any) => ({
    ...server,
    avgRating: ratingMap.get(server.id)?.avg ?? null,
    ratingCount: ratingMap.get(server.id)?.count ?? 0,
  }))
}

export async function getServerBySlug(owner: string, repo: string) {
  return db.select().from(servers).where(eq(servers.fullSlug, `${owner}/${repo}`)).limit(1).then((r: any) => r[0] ?? null)
}

export async function createServer(data: z.infer<typeof serverSchema>, userId?: string) {
  const validated = serverSchema.parse(data)
  const server = await db.insert(servers).values({
    ...validated,
    fullSlug: `${validated.owner}/${validated.repo}`,
  }).returning().then((r: any) => r[0])
  revalidatePath('/', 'layout')
  delCachePattern('servers:')
  await logAudit('server.create', 'Server', server.id, { name: server.name }, userId)
  await triggerWebhooks('server.created', buildServerPayload(server))
  return server
}

export async function updateServer(id: string, data: z.infer<typeof serverSchema>) {
  const userId = await requireAdmin()
  const validated = serverSchema.parse(data)
  const server = await db.update(servers).set({
    ...validated,
    fullSlug: `${validated.owner}/${validated.repo}`,
  }).where(eq(servers.id, id)).returning().then((r: any) => r[0])
  revalidatePath('/', 'layout')
  revalidatePath(`/servers/${validated.owner}/${validated.repo}`, 'layout')
  delCachePattern('servers:')
  await logAudit('server.update', 'Server', server.id, { name: server.name }, userId)
  await triggerWebhooks('server.updated', buildServerPayload(server))
  return server
}

export async function deleteServer(id: string, userId?: string) {
  await requireAdmin()
  const server = await db.select({ name: servers.name }).from(servers).where(eq(servers.id, id)).limit(1).then((r: any) => r[0] ?? null)
  await db.delete(servers).where(eq(servers.id, id))
  revalidatePath('/', 'layout')
  delCachePattern('servers:')
  await logAudit('server.delete', 'Server', id, { name: server?.name }, userId)
}

export async function deleteServers(ids: string[]) {
  const userId = await requireAdmin()
  await db.delete(servers).where(inArray(servers.id, ids))
  try { await logAudit('server.bulkDelete', 'Server', undefined, { count: ids.length }, userId) } catch { /* audit log failure — non-critical */ }
  revalidatePath('/', 'layout')
  revalidatePath('/admin/servers')
  delCachePattern('servers:')
}

export async function reorderFeaturedServers(orderedIds: string[]) {
  const userId = await requireAdmin()
  for (let i = 0; i < orderedIds.length; i++) {
    await db.update(servers).set({ updatedAt: new Date(Date.now() - i * 1000) }).where(eq(servers.id, orderedIds[i]))
  }
  try { await logAudit('server.reorderFeatured', 'Server', undefined, { count: orderedIds.length }, userId) } catch { /* audit log failure — non-critical */ }
  revalidatePath('/', 'layout')
  revalidatePath('/admin/servers')
}

export async function toggleServerFeatured(id: string, featured: boolean) {
  const userId = await requireAdmin()
  await db.update(servers).set({ featured }).where(eq(servers.id, id))
  try { await logAudit('server.toggleFeatured', 'Server', id, { featured }, userId) } catch { /* audit log failure — non-critical */ }
  revalidatePath('/', 'layout')
  revalidatePath('/admin/servers')
}
