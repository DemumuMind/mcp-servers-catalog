'use server'

import { db, servers } from '@/lib/db'

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
  const serverList = await db.select({
    id: servers.id,
    name: servers.name,
    category: servers.category,
    tags: servers.tags,
    stars: servers.stars,
    owner: servers.owner,
    repo: servers.repo,
  }).from(servers)

  const nodes: GraphNode[] = serverList.map((s: any) => ({
    id: s.id,
    name: s.name,
    category: s.category,
    owner: s.owner,
    repo: s.repo,
    val: Math.max(1, Math.log10((s.stars || 0) + 1) * 5),
  }))

  const links: GraphLink[] = []
  const linkSet = new Set<string>()

  for (let i = 0; i < serverList.length; i++) {
    for (let j = i + 1; j < serverList.length; j++) {
      const a = serverList[i]
      const b = serverList[j]
      const sharedTags = a.tags.filter((t: any) => b.tags.includes(t))
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
