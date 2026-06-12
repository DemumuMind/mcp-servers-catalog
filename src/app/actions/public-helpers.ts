import { db, servers } from '@/lib/db'
import { or, sql, desc, count } from 'drizzle-orm'

export const ITEMS_PER_PAGE = 12

/** Build search conditions from a search string — splits into words and creates AND logic across fields. */
export function buildSearchConditions(search: string | undefined, serversTable: typeof servers): any[] {
  const conditions: any[] = []
  if (!search) return conditions

  const words = search.toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 1) {
    const term = `%${words[0]}%`
    conditions.push(
      or(
        sql`LOWER(${serversTable.name}) LIKE ${term}`,
        sql`LOWER(${serversTable.description}) LIKE ${term}`,
        sql`LOWER(${serversTable.owner}) LIKE ${term}`,
        sql`LOWER(${serversTable.repo}) LIKE ${term}`,
        sql`EXISTS (SELECT 1 FROM json_each(${serversTable.tags}) WHERE LOWER(json_each.value) LIKE ${term})`,
      )
    )
  } else {
    for (const word of words) {
      const term = `%${word}%`
      conditions.push(
        or(
          sql`LOWER(${serversTable.name}) LIKE ${term}`,
          sql`LOWER(${serversTable.description}) LIKE ${term}`,
          sql`LOWER(${serversTable.owner}) LIKE ${term}`,
          sql`LOWER(${serversTable.repo}) LIKE ${term}`,
          sql`EXISTS (SELECT 1 FROM json_each(${serversTable.tags}) WHERE LOWER(json_each.value) LIKE ${term})`,
        )
      )
    }
  }
  return conditions
}

/** Remap flat userName/userImage columns into a nested user object */
export function attachUserInfo(row: Record<string, any>): any {
  const { userName, userImage, ...data } = row
  return {
    ...data,
    user: { name: userName, image: userImage },
  }
}

/** Get server categories with counts (shared between public.ts and advanced-search.ts) */
export async function getServerCategoriesAgg() {
  const result = await db.select({
    category: servers.category,
    count: count(),
  }).from(servers).groupBy(servers.category).orderBy(desc(count()))

  return result.map((r: any) => ({ name: r.category, count: r.count }))
}
