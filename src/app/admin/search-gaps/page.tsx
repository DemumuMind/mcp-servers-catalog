import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getSearchGaps, getTopSearches, getSearchStats } from '@/app/actions/search-analytics'
import { SearchGapsClient } from '@/components/search-gaps-client'

export const dynamic = 'force-dynamic'

export default async function AdminSearchGapsPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/ru/login')
  }

  const [gaps, topSearches, stats] = await Promise.all([
    getSearchGaps(50),
    getTopSearches(20),
    getSearchStats(),
  ])

  return (
    <SearchGapsClient
      gaps={gaps}
      topSearches={topSearches}
      stats={stats}
    />
  )
}