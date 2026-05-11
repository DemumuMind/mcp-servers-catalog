'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getSponsorships() {
  return prisma.sponsorship.findMany({
    include: { server: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createSponsorship(data: {
  serverId: string
  sponsorName: string
  sponsorUrl?: string
  sponsorLogo?: string
  endDate?: Date
  amount?: number
  currency?: string
  notes?: string
}) {
  const sponsorship = await prisma.sponsorship.create({
    data: {
      ...data,
      active: true,
    },
    include: { server: true },
  })

  // Also mark server as sponsored
  await prisma.server.update({
    where: { id: data.serverId },
    data: { isSponsored: true },
  })

  revalidatePath('/admin/sponsorships')
  revalidatePath('/', 'layout')
  return sponsorship
}

export async function updateSponsorship(
  id: string,
  data: {
    sponsorName?: string
    sponsorUrl?: string
    sponsorLogo?: string
    endDate?: Date | null
    amount?: number
    currency?: string
    notes?: string
    active?: boolean
  }
) {
  const sponsorship = await prisma.sponsorship.update({
    where: { id },
    data,
    include: { server: true },
  })

  // Sync isSponsored flag on server
  await prisma.server.update({
    where: { id: sponsorship.serverId },
    data: { isSponsored: data.active !== false },
  })

  revalidatePath('/admin/sponsorships')
  revalidatePath('/', 'layout')
  return sponsorship
}

export async function deleteSponsorship(id: string) {
  const sponsorship = await prisma.sponsorship.findUnique({ where: { id } })
  if (sponsorship) {
    await prisma.server.update({
      where: { id: sponsorship.serverId },
      data: { isSponsored: false },
    })
  }

  await prisma.sponsorship.delete({ where: { id } })
  revalidatePath('/admin/sponsorships')
  revalidatePath('/', 'layout')
}

export async function getActiveSponsoredServers() {
  return prisma.sponsorship.findMany({
    where: {
      active: true,
      OR: [
        { endDate: null },
        { endDate: { gt: new Date() } },
      ],
    },
    include: { server: true },
    orderBy: { createdAt: 'desc' },
    take: 6,
  })
}
