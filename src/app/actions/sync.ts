'use server'

import { prisma } from '@/lib/db'
import { fetchGitHubRepo, fetchRepoReadme } from '@/lib/github'
import { analyzeReadme, mergeTags } from '@/lib/readme-analysis'

export async function syncGitHubStats() {
  const servers = await prisma.server.findMany({
    where: {
      githubUrl: {
        startsWith: 'https://github.com/',
      },
    },
  })

  let updated = 0
  let failed = 0
  let enriched = 0

  for (const server of servers) {
    try {
      const data = await fetchGitHubRepo(server.githubUrl)
      
      // Fetch README for analysis
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

      await prisma.server.update({
        where: { id: server.id },
        data: {
          stars: data.stars,
          forks: data.forks,
          description: data.description || server.description,
          name: data.name || server.name,
          tags: newTags,
        },
      })
      updated++
      if (readmeAnalysis) enriched++
      
      // Sleep to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (err) {
      console.error(`Failed to sync ${server.githubUrl}:`, err)
      failed++
    }
  }

  return { updated, failed, enriched, total: servers.length }
}

export async function analyzeServerReadme(serverId: string) {
  const server = await prisma.server.findUnique({
    where: { id: serverId },
  })
  if (!server) return null

  const readme = await fetchRepoReadme(server.githubUrl)
  if (!readme) return null

  const analysis = analyzeReadme(readme)

  // Update tags with suggested ones if not already present
  const newTags = mergeTags(server.tags, [], analysis.suggestedTags)
  if (newTags.length > server.tags.length) {
    await prisma.server.update({
      where: { id: serverId },
      data: { tags: newTags },
    })
  }

  return { analysis, tagsUpdated: newTags.length > server.tags.length, newTags }
}
