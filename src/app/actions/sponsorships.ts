'use server'

import { db, sponsorships, servers } from '@/lib/db'
import { eq, desc, or, isNull, gt, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth-guard'
import { logAudit } from './audit-log'

export async function getSponsorships() {
  const rows = await db.select({
    id: sponsorships.id,
    serverId: sponsorships.serverId,
    sponsorName: sponsorships.sponsorName,
    sponsorUrl: sponsorships.sponsorUrl,
    sponsorLogo: sponsorships.sponsorLogo,
    startDate: sponsorships.startDate,
    endDate: sponsorships.endDate,
    amount: sponsorships.amount,
    currency: sponsorships.currency,
    notes: sponsorships.notes,
    active: sponsorships.active,
    createdAt: sponsorships.createdAt,
    updatedAt: sponsorships.updatedAt,
    // server fields
    serverIdCol: servers.id,
    serverName: servers.name,
    serverDescription: servers.description,
    serverOwner: servers.owner,
    serverRepo: servers.repo,
    serverFullSlug: servers.fullSlug,
    serverCategory: servers.category,
    serverIsOfficial: servers.isOfficial,
    serverIsSponsored: servers.isSponsored,
    serverGithubUrl: servers.githubUrl,
    serverTags: servers.tags,
    serverIsRemote: servers.isRemote,
    serverAuthType: servers.authType,
    serverEndpoint: servers.endpoint,
    serverFeatured: servers.featured,
    serverFeaturedUntil: servers.featuredUntil,
    serverSponsoredUntil: servers.sponsoredUntil,
    serverStars: servers.stars,
    serverForks: servers.forks,
    serverAuthorId: servers.authorId,
    serverCreatedAt: servers.createdAt,
    serverUpdatedAt: servers.updatedAt,
  }).from(sponsorships).innerJoin(servers, eq(sponsorships.serverId, servers.id)).orderBy(desc(sponsorships.createdAt))

  return rows.map((r: any) => ({
    id: r.id,
    serverId: r.serverId,
    sponsorName: r.sponsorName,
    sponsorUrl: r.sponsorUrl,
    sponsorLogo: r.sponsorLogo,
    startDate: r.startDate,
    endDate: r.endDate,
    amount: r.amount,
    currency: r.currency,
    notes: r.notes,
    active: r.active,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    server: {
      id: r.serverIdCol,
      name: r.serverName,
      description: r.serverDescription,
      owner: r.serverOwner,
      repo: r.serverRepo,
      fullSlug: r.serverFullSlug,
      category: r.serverCategory,
      isOfficial: r.serverIsOfficial,
      isSponsored: r.serverIsSponsored,
      githubUrl: r.serverGithubUrl,
      tags: r.serverTags,
      isRemote: r.serverIsRemote,
      authType: r.serverAuthType,
      endpoint: r.serverEndpoint,
      featured: r.serverFeatured,
      featuredUntil: r.serverFeaturedUntil,
      sponsoredUntil: r.serverSponsoredUntil,
      stars: r.serverStars,
      forks: r.serverForks,
      authorId: r.serverAuthorId,
      createdAt: r.serverCreatedAt,
      updatedAt: r.serverUpdatedAt,
    },
  }))
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
  const sponsorship = await db.insert(sponsorships).values({
    ...data,
    active: true,
  }).returning().then((r: any) => r[0])

  // Also mark server as sponsored
  await db.update(servers).set({ isSponsored: true }).where(eq(servers.id, data.serverId))

  // Get server data for the return value
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
  const sponsorship = await db.update(sponsorships).set(data).where(eq(sponsorships.id, id)).returning().then((r: any) => r[0])

  // Sync isSponsored flag on server
  await db.update(servers).set({ isSponsored: data.active !== false }).where(eq(servers.id, sponsorship.serverId))

  // Get server data for the return value
  const server = await db.select().from(servers).where(eq(servers.id, sponsorship.serverId)).limit(1).then((r: any) => r[0])

  try { await logAudit('sponsorship.update', 'Sponsorship', id, { sponsor: data.sponsorName, active: data.active }, userId) } catch { /* audit log failure — non-critical */ }
  revalidatePath('/admin/sponsorships')
  revalidatePath('/', 'layout')
  return { ...sponsorship, server }
}

export async function deleteSponsorship(id: string) {
  const userId = await requireAdmin()
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
  const rows = await db.select({
    id: sponsorships.id,
    serverId: sponsorships.serverId,
    sponsorName: sponsorships.sponsorName,
    sponsorUrl: sponsorships.sponsorUrl,
    sponsorLogo: sponsorships.sponsorLogo,
    startDate: sponsorships.startDate,
    endDate: sponsorships.endDate,
    amount: sponsorships.amount,
    currency: sponsorships.currency,
    notes: sponsorships.notes,
    active: sponsorships.active,
    createdAt: sponsorships.createdAt,
    updatedAt: sponsorships.updatedAt,
    // server fields
    serverName: servers.name,
    serverDescription: servers.description,
    serverOwner: servers.owner,
    serverRepo: servers.repo,
    serverFullSlug: servers.fullSlug,
    serverCategory: servers.category,
    serverIsOfficial: servers.isOfficial,
    serverIsSponsored: servers.isSponsored,
    serverGithubUrl: servers.githubUrl,
    serverTags: servers.tags,
    serverIsRemote: servers.isRemote,
    serverAuthType: servers.authType,
    serverEndpoint: servers.endpoint,
    serverFeatured: servers.featured,
    serverFeaturedUntil: servers.featuredUntil,
    serverSponsoredUntil: servers.sponsoredUntil,
    serverStars: servers.stars,
    serverForks: servers.forks,
    serverAuthorId: servers.authorId,
    serverCreatedAt: servers.createdAt,
    serverUpdatedAt: servers.updatedAt,
  }).from(sponsorships).innerJoin(servers, eq(sponsorships.serverId, servers.id)).where(
    and(
      eq(sponsorships.active, true),
      or(isNull(sponsorships.endDate), gt(sponsorships.endDate, now))
    )
  ).orderBy(desc(sponsorships.createdAt)).limit(6)

  return rows.map((r: any) => ({
    id: r.id,
    serverId: r.serverId,
    sponsorName: r.sponsorName,
    sponsorUrl: r.sponsorUrl,
    sponsorLogo: r.sponsorLogo,
    startDate: r.startDate,
    endDate: r.endDate,
    amount: r.amount,
    currency: r.currency,
    notes: r.notes,
    active: r.active,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    server: {
      id: r.serverId,
      name: r.serverName,
      description: r.serverDescription,
      owner: r.serverOwner,
      repo: r.serverRepo,
      fullSlug: r.serverFullSlug,
      category: r.serverCategory,
      isOfficial: r.serverIsOfficial,
      isSponsored: r.serverIsSponsored,
      githubUrl: r.serverGithubUrl,
      tags: r.serverTags,
      isRemote: r.serverIsRemote,
      authType: r.serverAuthType,
      endpoint: r.serverEndpoint,
      featured: r.serverFeatured,
      featuredUntil: r.serverFeaturedUntil,
      sponsoredUntil: r.serverSponsoredUntil,
      stars: r.serverStars,
      forks: r.serverForks,
      authorId: r.serverAuthorId,
      createdAt: r.serverCreatedAt,
      updatedAt: r.serverUpdatedAt,
    },
  }))
}
