// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock: next/cache
// ---------------------------------------------------------------------------
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))

// ---------------------------------------------------------------------------
// Mock: @/lib/action-helpers  (used by advanced-search)
// ---------------------------------------------------------------------------
vi.mock('@/lib/action-helpers', () => ({
  fetchRatingMap: vi.fn().mockResolvedValue(new Map()),
}))

// ---------------------------------------------------------------------------
// Mock: ./public-helpers  (used by advanced-search)
// ---------------------------------------------------------------------------
vi.mock('@/app/actions/public-helpers', () => ({
  ITEMS_PER_PAGE: 12,
  getServerCategoriesAgg: vi.fn().mockResolvedValue([]),
}))

// ---------------------------------------------------------------------------
// Chainable thenable helper – same pattern as profile.test.ts
// ---------------------------------------------------------------------------
const createChain = (resolveValue: any) => {
  const chain: Record<string, any> = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    onConflictDoUpdate: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    returning: vi.fn().mockImplementation(() => Promise.resolve(resolveValue)),
    groupBy: vi.fn().mockReturnThis(),
  }
  chain.then = (onFulfilled: any) => Promise.resolve(resolveValue).then(onFulfilled)
  return chain
}

// ---------------------------------------------------------------------------
// Mock: @/lib/db
// ---------------------------------------------------------------------------
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn().mockImplementation(() => createChain([])),
    insert: vi.fn().mockImplementation(() => createChain([])),
    update: vi.fn().mockImplementation(() => createChain([])),
    delete: vi.fn().mockImplementation(() => createChain([])),
  },
  servers: {
    id: 'id',
    name: 'name',
    owner: 'owner',
    repo: 'repo',
    description: 'description',
    category: 'category',
    stars: 'stars',
    forks: 'forks',
    isOfficial: 'isOfficial',
    isSponsored: 'isSponsored',
    isRemote: 'isRemote',
    tags: 'tags',
    endpoint: 'endpoint',
  },
  searchQueries: {
    id: 'id',
    query: 'query',
    results: 'results',
    userId: 'userId',
    source: 'source',
    createdAt: 'createdAt',
  },
}))

// ===========================================================================
// Tests
// ===========================================================================

describe('autocomplete – autocompleteServers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return empty array when query is too short', async () => {
    const { autocompleteServers } = await import('@/app/actions/autocomplete')

    const result = await autocompleteServers('')
    expect(result).toEqual([])

    const result2 = await autocompleteServers('a')
    expect(result2).toEqual([])
  })

  it('should return array of suggestions for a valid query', async () => {
    const { db } = await import('@/lib/db')
    const { autocompleteServers } = await import('@/app/actions/autocomplete')

    const mockServers = [
      { id: '1', name: 'MCP Server', owner: 'acme', repo: 'repo1', description: 'A server', stars: 100, category: 'tools' },
      { id: '2', name: 'Another MCP', owner: 'org', repo: 'repo2', description: 'Another', stars: 50, category: 'dev' },
    ]

    // First db.select call returns the main word-matched results
    // Second db.select call returns the tag-matched results (empty here)
    vi.mocked(db.select)
      .mockImplementationOnce(() => createChain(mockServers))
      .mockImplementationOnce(() => createChain([]))

    const result = await autocompleteServers('mcp')

    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(2)
    expect(result[0].name).toBe('MCP Server')
    expect(db.select).toHaveBeenCalled()
  })

  it('should combine word-matched and tag-matched results', async () => {
    const { db } = await import('@/lib/db')
    const { autocompleteServers } = await import('@/app/actions/autocomplete')

    const wordMatches = [
      { id: '1', name: 'Server A', owner: 'x', repo: 'r', description: 'desc', stars: 80, category: 'tools' },
    ]
    const tagMatches = [
      { id: '2', name: 'Server B', owner: 'y', repo: 'r2', description: 'desc2', stars: 40, category: 'dev' },
    ]

    vi.mocked(db.select)
      .mockImplementationOnce(() => createChain(wordMatches))
      .mockImplementationOnce(() => createChain(tagMatches))

    const result = await autocompleteServers('mcp')

    expect(result.length).toBe(2)
    expect(result).toEqual([...wordMatches, ...tagMatches])
  })
})

describe('autocomplete – getPopularTags', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return sorted tags with counts', async () => {
    const { db } = await import('@/lib/db')
    const { getPopularTags } = await import('@/app/actions/autocomplete')

    const mockRows = [
      { tags: ['typescript', 'python'] },
      { tags: ['typescript', 'go'] },
      { tags: ['python'] },
    ]

    vi.mocked(db.select).mockImplementationOnce(() => createChain(mockRows))

    const result = await getPopularTags(10)

    expect(Array.isArray(result)).toBe(true)
    // typescript appears 2x, python 2x, go 1x  — sorted by count desc
    expect(result[0].name).toBe('typescript')
    expect(result[0].count).toBe(2)
    expect(result.length).toBe(3)
  })
})

describe('advancedSearch – advancedSearchServers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return { servers, total } shape', async () => {
    const { db } = await import('@/lib/db')
    const { advancedSearchServers } = await import('@/app/actions/advanced-search')

    const mockServers = [
      { id: '1', name: 'Test Server', stars: 99, owner: 'acme', repo: 'repo', description: 'desc', category: 'tools' },
    ]

    // advancedSearch does Promise.all([db.select, db.select]) — two select calls
    vi.mocked(db.select)
      .mockImplementationOnce(() => createChain(mockServers))  // server rows
      .mockImplementationOnce(() => createChain([{ total: 1 }]))  // count

    const result = await advancedSearchServers({ search: 'test' })

    expect(result).toHaveProperty('servers')
    expect(result).toHaveProperty('total')
    expect(result).toHaveProperty('pages')
    expect(result).toHaveProperty('currentPage')
    expect(Array.isArray(result.servers)).toBe(true)
    expect(result.total).toBe(1)
  })

  it('should return servers with rating info', async () => {
    const { db } = await import('@/lib/db')
    const { fetchRatingMap } = await import('@/lib/action-helpers')
    const { advancedSearchServers } = await import('@/app/actions/advanced-search')

    const mockServers = [
      { id: 's1', name: 'Rated Server', stars: 50 },
    ]

    vi.mocked(db.select)
      .mockImplementationOnce(() => createChain(mockServers))
      .mockImplementationOnce(() => createChain([{ total: 1 }]))

    vi.mocked(fetchRatingMap).mockResolvedValueOnce(
      new Map([['s1', { avg: 4.5, count: 10 }]])
    )

    const result = await advancedSearchServers({})

    expect(result.servers[0].avgRating).toBe(4.5)
    expect(result.servers[0].ratingCount).toBe(10)
  })

  it('should filter servers by minRating', async () => {
    const { db } = await import('@/lib/db')
    const { fetchRatingMap } = await import('@/lib/action-helpers')
    const { advancedSearchServers } = await import('@/app/actions/advanced-search')

    const mockServers = [
      { id: 'a', name: 'Low', stars: 10 },
      { id: 'b', name: 'High', stars: 90 },
    ]

    vi.mocked(db.select)
      .mockImplementationOnce(() => createChain(mockServers))
      .mockImplementationOnce(() => createChain([{ total: 2 }]))

    vi.mocked(fetchRatingMap).mockResolvedValueOnce(
      new Map([
        ['a', { avg: 2, count: 1 }],
        ['b', { avg: 5, count: 5 }],
      ])
    )

    const result = await advancedSearchServers({ minRating: 4 })

    expect(result.servers.length).toBe(1)
    expect(result.servers[0].name).toBe('High')
  })

  it('should paginate correctly', async () => {
    const { db } = await import('@/lib/db')
    const { advancedSearchServers } = await import('@/app/actions/advanced-search')

    vi.mocked(db.select)
      .mockImplementationOnce(() => createChain([]))
      .mockImplementationOnce(() => createChain([{ total: 25 }]))

    const result = await advancedSearchServers({ page: 3 })

    expect(result.currentPage).toBe(3)
    expect(result.total).toBe(25)
    expect(result.pages).toBe(Math.ceil(25 / 12))
  })
})

describe('search-tracking – trackSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call db.insert and return success', async () => {
    const { db } = await import('@/lib/db')
    const { trackSearch } = await import('@/app/actions/search-tracking')

    vi.mocked(db.insert).mockImplementation(() => createChain([]))

    const result = await trackSearch('mcp server', 5, 'user1', 'web')

    expect(db.insert).toHaveBeenCalled()
    expect(result).toEqual({ success: true })
  })

  it('should return { success: false } for empty/whitespace query', async () => {
    const { db } = await import('@/lib/db')
    const { trackSearch } = await import('@/app/actions/search-tracking')

    const result = await trackSearch('   ', 0)

    expect(result).toEqual({ success: false })
    expect(db.insert).not.toHaveBeenCalled()
  })

  it('should trim and lowercase the query before insert', async () => {
    const { db } = await import('@/lib/db')
    const { searchQueries } = await import('@/lib/db')
    const { trackSearch } = await import('@/app/actions/search-tracking')

    const chain = createChain([])
    vi.mocked(db.insert).mockImplementation(() => chain)

    await trackSearch('  MCP Server  ', 3)

    expect(db.insert).toHaveBeenCalledWith(searchQueries)
    expect(chain.values).toHaveBeenCalledWith(
      expect.objectContaining({ query: 'mcp server' }),
    )
  })

  it('should default userId to null and source to "web"', async () => {
    const { db } = await import('@/lib/db')
    const { trackSearch } = await import('@/app/actions/search-tracking')

    const chain = createChain([])
    vi.mocked(db.insert).mockImplementation(() => chain)

    await trackSearch('test', 1)

    expect(chain.values).toHaveBeenCalledWith(
      expect.objectContaining({ userId: null, source: 'web' }),
    )
  })
})

describe('search-tracking – getPopularSearches', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return array of { query, count }', async () => {
    const { db } = await import('@/lib/db')
    const { getPopularSearches } = await import('@/app/actions/search-tracking')

    const mockResult = [
      { query: 'mcp', count: 42 },
      { query: 'server', count: 18 },
    ]

    vi.mocked(db.select).mockImplementationOnce(() => createChain(mockResult))

    const result = await getPopularSearches(10)

    expect(Array.isArray(result)).toBe(true)
    expect(result[0].query).toBe('mcp')
    expect(result[0].count).toBe(42)
  })
})

describe('search-tracking – getTrendingSearches', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return trending searches filtered by time window', async () => {
    const { db } = await import('@/lib/db')
    const { getTrendingSearches } = await import('@/app/actions/search-tracking')

    const mockResult = [
      { query: 'ai', count: 7 },
    ]

    vi.mocked(db.select).mockImplementationOnce(() => createChain(mockResult))

    const result = await getTrendingSearches(24, 5)

    expect(Array.isArray(result)).toBe(true)
    expect(result[0].query).toBe('ai')
    expect(result[0].count).toBe(7)
    expect(db.select).toHaveBeenCalled()
  })
})
