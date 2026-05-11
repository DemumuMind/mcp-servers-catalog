'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { triggerWebhooks } from './webhooks'
import { delCachePattern } from '@/lib/cache'
import { logAudit } from './audit-log'

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

export async function getServers(filters?: {
  category?: string
  isOfficial?: boolean
  isRemote?: boolean
  featured?: boolean
  search?: string
}) {
  const where: Prisma.ServerWhereInput = {}

  if (filters?.category && filters.category !== 'all') {
    where.category = filters.category
  }
  if (filters?.isOfficial !== undefined) {
    where.isOfficial = filters.isOfficial
  }
  if (filters?.isRemote !== undefined) {
    where.isRemote = filters.isRemote
  }
  if (filters?.featured !== undefined) {
    where.featured = filters.featured
  }
  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ]
  }

  const servers = await prisma.server.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  const serverIds = servers.map((s) => s.id)
  const ratingsAgg = serverIds.length > 0
    ? await prisma.rating.groupBy({
        by: ['serverId'],
        where: { serverId: { in: serverIds } },
        _avg: { value: true },
        _count: { value: true },
      })
    : []

  const ratingMap = new Map(ratingsAgg.map((r) => [r.serverId, { avg: r._avg.value, count: r._count.value }]))

  return servers.map((server) => ({
    ...server,
    avgRating: ratingMap.get(server.id)?.avg ?? null,
    ratingCount: ratingMap.get(server.id)?.count ?? 0,
  }))
}

export async function getServerBySlug(owner: string, repo: string) {
  return prisma.server.findUnique({
    where: { fullSlug: `${owner}/${repo}` },
  })
}

export async function createServer(data: z.infer<typeof serverSchema>, userId?: string) {
  const validated = serverSchema.parse(data)
  const server = await prisma.server.create({
    data: {
      ...validated,
      fullSlug: `${validated.owner}/${validated.repo}`,
    },
  })
  revalidatePath('/', 'layout')
  delCachePattern('servers:')
  await logAudit('server.create', 'Server', server.id, { name: server.name }, userId)
  await triggerWebhooks('server.created', {
    id: server.id,
    name: server.name,
    owner: server.owner,
    repo: server.repo,
    category: server.category,
  })
  return server
}

export async function updateServer(id: string, data: z.infer<typeof serverSchema>) {
  const validated = serverSchema.parse(data)
  const server = await prisma.server.update({
    where: { id },
    data: {
      ...validated,
      fullSlug: `${validated.owner}/${validated.repo}`,
    },
  })
  revalidatePath('/', 'layout')
  revalidatePath(`/servers/${validated.owner}/${validated.repo}`, 'layout')
  delCachePattern('servers:')
  await triggerWebhooks('server.updated', {
    id: server.id,
    name: server.name,
    owner: server.owner,
    repo: server.repo,
    category: server.category,
  })
  return server
}

export async function deleteServer(id: string, userId?: string) {
  const server = await prisma.server.findUnique({ where: { id }, select: { name: true } })
  await prisma.server.delete({ where: { id } })
  revalidatePath('/', 'layout')
  delCachePattern('servers:')
  await logAudit('server.delete', 'Server', id, { name: server?.name }, userId)
}

export async function deleteServers(ids: string[]) {
  await prisma.server.deleteMany({
    where: { id: { in: ids } },
  })
  revalidatePath('/', 'layout')
  revalidatePath('/admin/servers')
  delCachePattern('servers:')
}

export async function reorderFeaturedServers(orderedIds: string[]) {
  for (let i = 0; i < orderedIds.length; i++) {
    await prisma.server.update({
      where: { id: orderedIds[i] },
      data: { updatedAt: new Date(Date.now() - i * 1000) },
    })
  }
  revalidatePath('/', 'layout')
  revalidatePath('/admin/servers')
}

export async function toggleServerFeatured(id: string, featured: boolean) {
  await prisma.server.update({
    where: { id },
    data: { featured },
  })
  revalidatePath('/', 'layout')
  revalidatePath('/admin/servers')
}
