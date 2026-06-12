import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getSearchGaps, getTopSearches, getSearchStats } from '@/app/actions/search-analytics'
import { SearchGapsClient } from '@/components/search-gaps-client'

type SearchGap = { query: string; count: number; lastSearch: string }
type SearchStats = { total: number; unique: number; zeroResults: number; withResults: number; withoutResults: number; gapRate: number }

export const dynamic = 'force-dynamic'

export default async function AdminSearchGapsPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/ru/login')
  }

  const [gaps, topSearches, rawStats] = await Promise.all([
    getSearchGaps(50),
    getTopSearches(20),
    getSearchStats(),
  ])
  const raw = rawStats as { total: number; unique: number; zeroResults: number }
  const stats: SearchStats = { ...raw, withResults: raw.total - raw.zeroResults, withoutResults: raw.zeroResults, gapRate: raw.total > 0 ? Math.round(raw.zeroResults / raw.total * 100) : 0 }

  return (
    <SearchGapsClient
      gaps={gaps as SearchGap[]}
      topSearches={topSearches}
      stats={stats}
    />
  )
}
