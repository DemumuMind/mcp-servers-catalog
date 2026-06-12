'use server'

import { db, servers } from '@/lib/db'
import { eq, like, asc, inArray, lt, and } from 'drizzle-orm'
import { fetchGitHubRepo, fetchRepoReadme, waitForRateLimit, getRateLimitInfo, type RateLimitInfo } from '@/lib/github'
import { analyzeReadme, mergeTags } from '@/lib/readme-analysis'

/** Number of servers to process before inserting a delay between chunks. */
const BATCH_SIZE = parseInt(process.env.SYNC_BATCH_SIZE || '50', 10)

/** Milliseconds to sleep between chunks to avoid rate limiting. */
const CHUNK_DELAY_MS = parseInt(process.env.SYNC_CHUNK_DELAY_MS || '1000', 10)

/** If remaining API calls drop below this, pause until the reset window. */
const RATE_LIMIT_THRESHOLD = parseInt(process.env.SYNC_RATE_LIMIT_THRESHOLD || '100', 10)

export interface SyncProgress {
  updated: number
  failed: number
  enriched: number
  skipped: number
  processed: number
  total: number
  rateLimitRemaining: number
  rateLimitLimit: number
  rateLimitResetAt: string | null
}

export interface SyncOptions {
  /** Only sync servers whose `updatedAt` is before this date (oldest-first sync). */
  since?: Date
  /** Only sync specific server IDs (targeted re-sync). */
  serverIds?: string[]
  /** Maximum number of servers to sync in this run (0 = unlimited). */
  limit?: number
}

/** Fetch a single GitHub repo and persist updated stats to the database. */
async function fetchGitHubRepoData(
  server: { id: string; githubUrl: string; tags: string[]; description: string | null; name: string },
  includeReadme: boolean = true,
): Promise<{ updated: boolean; enriched: boolean }> {
  const data = await fetchGitHubRepo(server.githubUrl)

  let readmeAnalysis = null
  if (includeReadme) {
    try {
      const readme = await fetchRepoReadme(server.githubUrl)
      if (readme) {
        readmeAnalysis = analyzeReadme(readme)
      }
    } catch (readmeErr) {
      console.warn(`Failed to analyze README for ${server.githubUrl}:`, readmeErr)
    }
  }

  const newTags = readmeAnalysis
    ? mergeTags(server.tags, data.topics || [], readmeAnalysis.suggestedTags)
    : mergeTags(server.tags, data.topics || [], [])

  await db
    .update(servers)
    .set({
      stars: data.stars,
      forks: data.forks,
      description: data.description || server.description || '',
      name: data.name || server.name,
      tags: newTags,
    })
    .where(eq(servers.id, server.id))

  return { updated: true, enriched: !!readmeAnalysis }
}

/** Process a batch (chunk) of servers, returning counts of updated/enriched/failed. */
async function processBatchResults(
  chunk: { id: string; githubUrl: string; tags: string[]; description: string | null; name: string }[],
): Promise<{ updated: number; enriched: number; failed: number }> {
  let updated = 0
  let enriched = 0
  let failed = 0

  for (const server of chunk) {
    try {
      const result = await fetchGitHubRepoData(server)
      if (result.updated) updated++
      if (result.enriched) enriched++
    } catch (err: any) {
      if (err?.message?.includes('rate limit')) {
        console.error(`Rate limit hit at server ${server.githubUrl}. Pausing.`)
        await waitForRateLimit(RATE_LIMIT_THRESHOLD)
        try {
          const result = await fetchGitHubRepoData(server, false)
          if (result.updated) updated++
        } catch {
          failed++
        }
      } else {
        console.error(`Failed to sync ${server.githubUrl}:`, err)
        failed++
      }
    }
  }

  return { updated, enriched, failed }
}

export async function syncGitHubStats(options: SyncOptions = {}): Promise<SyncProgress> {
  const { since, serverIds, limit = 0 } = options

  let query = db
    .select()
    .from(servers)
    .where(like(servers.githubUrl, 'https://github.com/%'))
    .orderBy(asc(servers.updatedAt))

  if (since) {
    query = db
      .select()
      .from(servers)
      .where(and(
        like(servers.githubUrl, 'https://github.com/%'),
        lt(servers.updatedAt, since)
      ))
      .orderBy(asc(servers.updatedAt))
  }

  if (serverIds && serverIds.length > 0) {
    query = db
      .select()
      .from(servers)
      .where(and(
        like(servers.githubUrl, 'https://github.com/%'),
        inArray(servers.id, serverIds)
      ))
      .orderBy(asc(servers.updatedAt))
  }

  let serverList = await query

  if (limit > 0 && serverList.length > limit) {
    serverList = serverList.slice(0, limit)
  }

  const total = serverList.length
  let updated = 0
  let failed = 0
  let enriched = 0
  let skipped = 0
  let processed = 0

  let rateLimit: RateLimitInfo = await getRateLimitInfo()

  for (let chunkStart = 0; chunkStart < total; chunkStart += BATCH_SIZE) {
    const chunk = serverList.slice(chunkStart, chunkStart + BATCH_SIZE)

    rateLimit = await waitForRateLimit(RATE_LIMIT_THRESHOLD)

    const batchResult = await processBatchResults(chunk)
    updated += batchResult.updated
    enriched += batchResult.enriched
    failed += batchResult.failed
    processed += chunk.length

    if (chunkStart + BATCH_SIZE < total) {
      await new Promise((resolve) => setTimeout(resolve, CHUNK_DELAY_MS))
    }

    // [sync] Chunk progress logged via server-side monitoring
  }

  rateLimit = await getRateLimitInfo()

  return {
    updated,
    failed,
    enriched,
    skipped,
    processed,
    total,
    rateLimitRemaining: rateLimit.remaining,
    rateLimitLimit: rateLimit.limit,
    rateLimitResetAt: rateLimit.resetAt.toISOString(),
  }
}

export async function analyzeServerReadme(serverId: string) {
  const rows = await db
    .select()
    .from(servers)
    .where(eq(servers.id, serverId))
    .limit(1)

  const server = rows[0]
  if (!server) return null

  const readme = await fetchRepoReadme(server.githubUrl)
  if (!readme) return null

  const analysis = analyzeReadme(readme)

  const newTags = mergeTags(server.tags, [], analysis.suggestedTags)
  if (newTags.length > server.tags.length) {
    await db
      .update(servers)
      .set({ tags: newTags })
      .where(eq(servers.id, serverId))
  }

  return { analysis, tagsUpdated: newTags.length > server.tags.length, newTags }
}
