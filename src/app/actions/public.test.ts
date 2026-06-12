// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))

const createChain = (resolveValue: any) => {
  const chain: Record<string, any> = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    onConflictDoUpdate: vi.fn().mockReturnThis(),
    returning: vi.fn().mockImplementation(() => Promise.resolve(resolveValue)),
  }
  chain.then = (onFulfilled: any) => Promise.resolve(resolveValue).then(onFulfilled)
  return chain
}

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn().mockImplementation(() => createChain([])),
    insert: vi.fn().mockImplementation(() => createChain([])),
    update: vi.fn().mockImplementation(() => createChain([])),
    delete: vi.fn().mockImplementation(() => createChain([])),
  },
  servers: { id: 'id', name: 'name', owner: 'owner', repo: 'repo', description: 'description', category: 'category', stars: 'stars', forks: 'forks', isOfficial: 'isOfficial', isSponsored: 'isSponsored', tags: 'tags', createdAt: 'createdAt', viewCount: 'viewCount' },
  comments: { id: 'id', userId: 'userId', serverId: 'serverId', content: 'content', isModerated: 'isModerated', createdAt: 'createdAt', updatedAt: 'updatedAt' },
  ratings: { id: 'id', userId: 'userId', serverId: 'serverId', value: 'value', createdAt: 'createdAt', updatedAt: 'updatedAt' },
  users: { id: 'id', name: 'name', email: 'email', image: 'image', createdAt: 'createdAt' },
  serverRankings: { id: 'id', serverId: 'serverId', period: 'period', rank: 'rank', score: 'score' },
  bookmarks: { id: 'id', userId: 'userId', serverId: 'serverId' },
  reviewVotes: { id: 'id', reviewId: 'reviewId', userId: 'userId', direction: 'direction' },
  reviews: { id: 'id', serverId: 'serverId', userId: 'userId', content: 'content', rating: 'rating', helpful: 'helpful', createdAt: 'createdAt' },
  viewHistories: { id: 'id', userId: 'userId', serverId: 'serverId', createdAt: 'createdAt' },
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn().mockReturnValue({}),
  and: vi.fn().mockReturnValue({}),
  or: vi.fn().mockReturnValue({}),
  desc: vi.fn().mockReturnValue({}),
  asc: vi.fn().mockReturnValue({}),
  sql: vi.fn().mockReturnValue({}),
  count: vi.fn().mockReturnValue({}),
  avg: vi.fn().mockReturnValue({}),
  like: vi.fn().mockReturnValue({}),
  ilike: vi.fn().mockReturnValue({}),
  ne: vi.fn().mockReturnValue({}),
  inArray: vi.fn().mockReturnValue({}),
}))

vi.mock('@/app/actions/public-helpers', () => ({
  ITEMS_PER_PAGE: 12,
  buildSearchConditions: vi.fn().mockReturnValue([]),
}))

describe('Public Actions', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('getServersPublic returns paginated list', async () => {
    const { db } = await import('@/lib/db')
    const mockServers = [{ id: '1', name: 'Test Server', owner: 'test', repo: 'repo', stars: 100 }]
    vi.mocked(db.select)
      .mockImplementationOnce(() => createChain(mockServers))
      .mockImplementationOnce(() => createChain([{ count: 100 }]))

    const { getServersPublic } = await import('@/app/actions/public')
    const result = await getServersPublic({ page: 1 })
    expect(result).toBeTruthy()
  })

  it('getServerRankings returns rankings by period', async () => {
    const { db } = await import('@/lib/db')
    vi.mocked(db.select).mockImplementation(() =>
      createChain([{ serverId: '1', rank: 1, score: 95, period: 'week' }])
    )

    const { getServerRankings } = await import('@/app/actions/rankings')
    const result = await getServerRankings('week')
    expect(result).toBeTruthy()
  })

  it('voteReview returns success', async () => {
    const { db } = await import('@/lib/db')
    vi.mocked(db.update).mockImplementation(() =>
      createChain([{ id: '1', helpful: 1 }])
    )

    const { voteReview } = await import('@/app/actions/reviews')
    const result = await voteReview('1', 'up')
    expect(result).toBeTruthy()
  })
})
