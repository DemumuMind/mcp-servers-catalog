// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn().mockResolvedValue(true),
    hash: vi.fn().mockResolvedValue('hashed_password'),
  },
}))

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
  apiKeys: { id: 'id', userId: 'userId', key: 'key', name: 'name', createdAt: 'createdAt', lastUsedAt: 'lastUsedAt' },
  users: { id: 'id', email: 'email', password: 'password', name: 'name', role: 'role', createdAt: 'createdAt' },
}))

vi.mock('@/lib/db/schema', () => ({
  users: { id: 'id', email: 'email', password: 'password', name: 'name', role: 'role', createdAt: 'createdAt' },
  apiKeys: { id: 'id', userId: 'userId', key: 'key', name: 'name', createdAt: 'createdAt', lastUsedAt: 'lastUsedAt' },
}))

vi.mock('@/lib/db/schema', () => ({
  users: { id: 'id', email: 'email', password: 'password', name: 'name', role: 'role', createdAt: 'createdAt' },
  apiKeys: { id: 'id', userId: 'userId', key: 'key', name: 'name', createdAt: 'createdAt', lastUsedAt: 'lastUsedAt' },
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn().mockReturnValue({}),
  and: vi.fn().mockReturnValue({}),
  desc: vi.fn().mockReturnValue({}),
}))

describe('Validation', () => {
  it('rejects empty URL', async () => {
    const { validateServer } = await import('@/app/actions/validation')
    const result = await validateServer('')
    expect(result.valid).toBe(false)
  })

  it('rejects non-URL string', async () => {
    const { validateServer } = await import('@/app/actions/validation')
    const result = await validateServer('not-a-url')
    expect(result.valid).toBe(false)
  })

  it('validateServer returns ValidationResult shape', async () => {
    const { validateServer } = await import('@/app/actions/validation')
    const result = await validateServer('https://github.com/nonexistent/repo-that-does-not-exist-12345')
    expect(result).toHaveProperty('valid')
    expect(result).toHaveProperty('checks')
    expect(Array.isArray(result.checks)).toBe(true)
  })
})

describe('API Keys', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('creates API key and returns it', async () => {
    const { db } = await import('@/lib/db')
    vi.mocked(db.insert).mockImplementation(() =>
      createChain([{ id: '1', userId: '1', key: 'mcp_key_test123', name: 'test-key' }])
    )

    const { createApiKey } = await import('@/app/actions/api-keys')
    const result = await createApiKey('1', 'test-key')
    expect(result.success).toBe(true)
    expect(db.insert).toHaveBeenCalled()
  })

  it('lists API keys for user', async () => {
    const { db } = await import('@/lib/db')
    vi.mocked(db.select).mockImplementation(() =>
      createChain([{ id: '1', name: 'key1', createdAt: new Date() }])
    )

    const { listApiKeys } = await import('@/app/actions/api-keys')
    const result = await listApiKeys('1')
    expect(Array.isArray(result)).toBe(true)
  })
})
