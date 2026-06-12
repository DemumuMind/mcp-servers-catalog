// @vitest-environment node
import { describe, it, expect, vi } from 'vitest'

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
    innerJoin: vi.fn().mockReturnThis(),
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
  users: {
    id: 'id',
    name: 'name',
    email: 'email',
    image: 'image',
    password: 'password',
    emailNotifications: 'emailNotifications',
    createdAt: 'createdAt',
  },
  comments: {
    id: 'id',
    userId: 'userId',
    serverId: 'serverId',
    content: 'content',
    isModerated: 'isModerated',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
  ratings: {
    id: 'id',
    userId: 'userId',
    serverId: 'serverId',
    value: 'value',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
  viewHistories: {
    id: 'id',
    userId: 'userId',
    serverId: 'serverId',
    createdAt: 'createdAt',
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
    tags: 'tags',
  },
  bookmarks: {
    id: 'id',
    userId: 'userId',
    serverId: 'serverId',
  },
}))

describe('Profile Actions', () => {
  it('should get user profile', async () => {
    const { db } = await import('@/lib/db')
    const { getUserProfile } = await import('@/app/actions/profile')
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      createdAt: new Date(),
      emailNotifications: true,
    }
    vi.mocked(db.select)
      .mockImplementationOnce(() => createChain([mockUser]))
      .mockImplementationOnce(() => createChain([{ count: 5 }]))
      .mockImplementationOnce(() => createChain([{ count: 3 }]))
      .mockImplementationOnce(() => createChain([{ count: 2 }]))

    const result = await getUserProfile('1')
    expect(result).toBeTruthy()
    expect(result?.name).toBe('Test User')
    expect(result?._count?.bookmarks).toBe(5)
  })

  it('should update profile name', async () => {
    const { db } = await import('@/lib/db')
    const { updateProfile } = await import('@/app/actions/profile')
    const mockUser = { id: '1', name: 'New Name', email: 'test@example.com' }
    vi.mocked(db.update).mockImplementation(() => createChain([mockUser]))
    const result = await updateProfile('1', { name: 'New Name' })
    expect(result.success).toBe(true)
  })

  it('should track server view', async () => {
    const { db } = await import('@/lib/db')
    const { trackServerView } = await import('@/app/actions/profile')
    vi.mocked(db.insert).mockImplementation(() => createChain([{}]))
    await trackServerView('user1', 'server1')
    expect(db.insert).toHaveBeenCalled()
  })
})
