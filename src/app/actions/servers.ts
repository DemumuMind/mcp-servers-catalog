'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/db'

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
  const where: any = {}

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

  return prisma.server.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
}

export async function getServerBySlug(owner: string, repo: string) {
  return prisma.server.findUnique({
    where: { fullSlug: `${owner}/${repo}` },
  })
}

export async function createServer(data: z.infer<typeof serverSchema>) {
  const validated = serverSchema.parse(data)
  const server = await prisma.server.create({
    data: {
      ...validated,
      fullSlug: `${validated.owner}/${validated.repo}`,
    },
  })
  revalidatePath('/')
  revalidatePath('/all')
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
  revalidatePath('/')
  revalidatePath(`/servers/${validated.owner}/${validated.repo}`)
  return server
}

export async function deleteServer(id: string) {
  await prisma.server.delete({ where: { id } })
  revalidatePath('/')
  revalidatePath('/all')
}
