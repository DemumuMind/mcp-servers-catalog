'use server'

import { db, bookmarks, servers } from '@/lib/db'
import { eq, desc } from 'drizzle-orm'

async function fetchUserBookmarks(userId: string) {
  return db.select({
    id: servers.id,
    name: servers.name,
    description: servers.description,
    owner: servers.owner,
    repo: servers.repo,
    category: servers.category,
    githubUrl: servers.githubUrl,
    tags: servers.tags,
    stars: servers.stars,
    bookmarkedAt: bookmarks.createdAt,
  }).from(bookmarks).innerJoin(servers, eq(bookmarks.serverId, servers.id)).where(eq(bookmarks.userId, userId)).orderBy(desc(bookmarks.createdAt))
}

export async function exportBookmarksJSON(userId: string): Promise<string> {
  const userBookmarks = await fetchUserBookmarks(userId)
  return JSON.stringify(userBookmarks, null, 2)
}

export async function exportBookmarksCSV(userId: string): Promise<string> {
  const userBookmarks = await fetchUserBookmarks(userId)

  const headers = ['Name', 'Owner', 'Repo', 'Category', 'Stars', 'Tags', 'GitHub URL', 'Bookmarked At']
  const rows = userBookmarks.map((b: any) => [
    b.name,
    b.owner,
    b.repo,
    b.category,
    b.stars.toString(),
    b.tags.join(', '),
    b.githubUrl,
    new Date(b.bookmarkedAt).toISOString(),
  ])

  return [headers, ...rows]
    .map((row) =>
      row
        .map((cell: any) => {
          const str = String(cell).replace(/"/g, '""')
          return str.includes(',') || str.includes('"') ? `"${str}"` : str
        })
        .join(',')
    )
    .join('\n')
}
