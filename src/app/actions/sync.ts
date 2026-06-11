'use server'

import { db, servers } from '@/lib/db'
import { eq, like } from 'drizzle-orm'
import { fetchGitHubRepo, fetchRepoReadme } from '@/lib/github'
import { analyzeReadme, mergeTags } from '@/lib/readme-analysis'

export async function syncGitHubStats() {
  const serverList = await db
    .select()
    .from(servers)
    .where(like(servers.githubUrl, 'https://github.com/%'))

  let updated = 0
  let failed = 0
  let enriched = 0

  for (const server of serverList) {
    try {
      const data = await fetchGitHubRepo(server.githubUrl)
      
      let readmeAnalysis = null
      try {
        const readme = await fetchRepoReadme(server.githubUrl)
        if (readme) {
          readmeAnalysis = analyzeReadme(readme)
        }
      } catch (readmeErr) {
        console.warn(`Failed to analyze README for ${server.githubUrl}:`, readmeErr)
      }

      const newTags = readmeAnalysis
        ? mergeTags(server.tags, data.topics || [], readmeAnalysis.suggestedTags)
        : mergeTags(server.tags, data.topics || [], [])

      await db
        .update(servers)
        .set({
          stars: data.stars,
          forks: data.forks,
          description: data.description || server.description,
          name: data.name || server.name,
          tags: newTags,
        })
        .where(eq(servers.id, server.id))
      updated++
      if (readmeAnalysis) enriched++
      
      // Sleep to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (err) {
      console.error(`Failed to sync ${server.githubUrl}:`, err)
      failed++
    }
  }

  return { updated, failed, enriched, total: serverList.length }
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

  // Update tags with suggested ones if not already present
  const newTags = mergeTags(server.tags, [], analysis.suggestedTags)
  if (newTags.length > server.tags.length) {
    await db
      .update(servers)
      .set({ tags: newTags })
      .where(eq(servers.id, serverId))
  }

  return { analysis, tagsUpdated: newTags.length > server.tags.length, newTags }
}
