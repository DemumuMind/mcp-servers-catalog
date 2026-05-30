'use server'

import { prisma } from '@/lib/db'

interface GraphNode {
  id: string
  name: string
  category: string
  owner: string
  repo: string
  val: number // size based on stars
}

interface GraphLink {
  source: string
  target: string
  strength: number
}

export async function getServerGraphData() {
  const servers = await prisma.server.findMany({
    select: {
      id: true,
      name: true,
      category: true,
      tags: true,
      stars: true,
      owner: true,
      repo: true,
    },
  })

  const nodes: GraphNode[] = servers.map((s) => ({
    id: s.id,
    name: s.name,
    category: s.category,
    owner: s.owner,
    repo: s.repo,
    val: Math.max(1, Math.log10((s.stars || 0) + 1) * 5),
  }))

  const links: GraphLink[] = []
  const linkSet = new Set<string>()

  // Create links based on shared tags
  for (let i = 0; i < servers.length; i++) {
    for (let j = i + 1; j < servers.length; j++) {
      const a = servers[i]
      const b = servers[j]
      const sharedTags = a.tags.filter((t) => b.tags.includes(t))
      const sameCategory = a.category === b.category

      if (sharedTags.length > 0 || sameCategory) {
        const strength = sharedTags.length * 2 + (sameCategory ? 1 : 0)
        const linkId = [a.id, b.id].sort().join('-')
        if (!linkSet.has(linkId)) {
          linkSet.add(linkId)
          links.push({ source: a.id, target: b.id, strength })
        }
      }
    }
  }

  return { nodes, links }
}
