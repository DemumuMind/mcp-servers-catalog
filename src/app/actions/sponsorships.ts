'use server'

import { db, sponsorships, servers } from '@/lib/db'
import { eq, desc, or, isNull, gt, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth-guard'
import { logAudit } from './audit-log'
import { sponsorshipServerSelect, mapSponsorshipRow } from './sponsorship-helpers'

export async function getSponsorships() {
  const rows = await db.select(sponsorshipServerSelect)
    .from(sponsorships)
    .innerJoin(servers, eq(sponsorships.serverId, servers.id))
    .orderBy(desc(sponsorships.createdAt))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rows.map((r: any) => mapSponsorshipRow(r))
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
  const userId = await requireAdmin()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sponsorship = await db.insert(sponsorships).values({
    ...data,
    active: true,
  }).returning().then((r: any) => r[0])

  await db.update(servers).set({ isSponsored: true }).where(eq(servers.id, data.serverId))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const server = await db.select().from(servers).where(eq(servers.id, data.serverId)).limit(1).then((r: any) => r[0])

  try { await logAudit('sponsorship.create', 'Sponsorship', sponsorship.id, { sponsor: data.sponsorName, serverId: data.serverId }, userId) } catch { /* audit log failure — non-critical */ }
  revalidatePath('/admin/sponsorships')
  revalidatePath('/', 'layout')
  return { ...sponsorship, server }
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
  const userId = await requireAdmin()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sponsorship = await db.update(sponsorships).set(data).where(eq(sponsorships.id, id)).returning().then((r: any) => r[0])

  await db.update(servers).set({ isSponsored: data.active !== false }).where(eq(servers.id, sponsorship.serverId))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const server = await db.select().from(servers).where(eq(servers.id, sponsorship.serverId)).limit(1).then((r: any) => r[0])

  try { await logAudit('sponsorship.update', 'Sponsorship', id, { sponsor: data.sponsorName, active: data.active }, userId) } catch { /* audit log failure — non-critical */ }
  revalidatePath('/admin/sponsorships')
  revalidatePath('/', 'layout')
  return { ...sponsorship, server }
}

export async function deleteSponsorship(id: string) {
  const userId = await requireAdmin()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sponsorship = await db.select().from(sponsorships).where(eq(sponsorships.id, id)).limit(1).then((r: any) => r[0])
  if (sponsorship) {
    await db.update(servers).set({ isSponsored: false }).where(eq(servers.id, sponsorship.serverId))
  }

  await db.delete(sponsorships).where(eq(sponsorships.id, id))
  try { await logAudit('sponsorship.delete', 'Sponsorship', id, undefined, userId) } catch { /* audit log failure — non-critical */ }
  revalidatePath('/admin/sponsorships')
  revalidatePath('/', 'layout')
}

export async function getActiveSponsoredServers() {
  const now = new Date()
  const rows = await db.select(sponsorshipServerSelect)
    .from(sponsorships)
    .innerJoin(servers, eq(sponsorships.serverId, servers.id))
    .where(
      and(
        eq(sponsorships.active, true),
        or(isNull(sponsorships.endDate), gt(sponsorships.endDate, now))
      )
    ).orderBy(desc(sponsorships.createdAt)).limit(6)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rows.map((r: any) => mapSponsorshipRow(r))
}
