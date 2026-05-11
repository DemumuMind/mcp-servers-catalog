'use server'

import { prisma } from '@/lib/db'

export async function exportBookmarksJSON(userId: string): Promise<string> {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId },
    include: { server: true },
    orderBy: { createdAt: 'desc' },
  })

  return JSON.stringify(
    bookmarks.map((b) => ({
      id: b.server.id,
      name: b.server.name,
      description: b.server.description,
      owner: b.server.owner,
      repo: b.server.repo,
      category: b.server.category,
      githubUrl: b.server.githubUrl,
      tags: b.server.tags,
      stars: b.server.stars,
      bookmarkedAt: b.createdAt,
    })),
    null,
    2
  )
}

export async function exportBookmarksCSV(userId: string): Promise<string> {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId },
    include: { server: true },
    orderBy: { createdAt: 'desc' },
  })

  const headers = ['Name', 'Owner', 'Repo', 'Category', 'Stars', 'Tags', 'GitHub URL', 'Bookmarked At']
  const rows = bookmarks.map((b) => [
    b.server.name,
    b.server.owner,
    b.server.repo,
    b.server.category,
    b.server.stars.toString(),
    b.server.tags.join(', '),
    b.server.githubUrl,
    new Date(b.createdAt).toISOString(),
  ])

  return [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => {
          const str = String(cell).replace(/"/g, '""')
          return str.includes(',') || str.includes('"') ? `"${str}"` : str
        })
        .join(',')
    )
    .join('\n')
}
