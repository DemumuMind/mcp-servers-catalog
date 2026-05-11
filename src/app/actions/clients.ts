'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'

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
  const where: Prisma.ClientWhereInput = {}

  if (filters?.featured !== undefined) {
    where.featured = filters.featured
  }
  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ]
  }

  return prisma.client.findMany({
    where,
    orderBy: { name: 'asc' },
  })
}

export async function getClientById(id: string) {
  return prisma.client.findUnique({
    where: { id },
  })
}

export async function createClient(data: z.infer<typeof clientSchema>) {
  const validated = clientSchema.parse(data)
  const client = await prisma.client.create({
    data: validated,
  })
  revalidatePath('/', 'layout')
  return client
}

export async function updateClient(id: string, data: z.infer<typeof clientSchema>) {
  const validated = clientSchema.parse(data)
  const client = await prisma.client.update({
    where: { id },
    data: validated,
  })
  revalidatePath('/', 'layout')
  return client
}

export async function deleteClient(id: string) {
  await prisma.client.delete({ where: { id } })
  revalidatePath('/', 'layout')
}

export async function deleteClients(ids: string[]) {
  await prisma.client.deleteMany({
    where: { id: { in: ids } },
  })
  revalidatePath('/', 'layout')
  revalidatePath('/admin/clients')
}
