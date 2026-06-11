import { describe, it, expect, vi } from 'vitest'
import {
  getUserProfile,
  getUserComments,
  getUserRatings,
  getUserHistory,
  trackServerView,
  updateProfile,
  updatePassword,
  updateSettings,
} from '@/app/actions/profile'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn().mockResolvedValue(true),
    hash: vi.fn().mockResolvedValue('hashed_password'),
  },
}))

// Drizzle db mock — chainable thenable builder
const createThenable = (resolveValue: any) => {
  const chain: any = {
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
  // Make the chain thenable so `.then()` works
  chain.then = (onFulfilled: any) => Promise.resolve(resolveValue).then(onFulfilled)
  return chain
}

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn().mockImplementation(() => createThenable([])),
    insert: vi.fn().mockImplementation(() => createThenable([])),
    update: vi.fn().mockImplementation(() => createThenable([])),
    delete: vi.fn().mockImplementation(() => createThenable([])),
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
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      createdAt: new Date(),
      emailNotifications: true,
      _count: { bookmarks: 5, comments: 3, ratings: 2 },
    }

    // getUserProfile calls db.select 4 times: user, bookmark count, comment count, rating count
    vi.mocked(db.select)
      .mockImplementationOnce(() => createThenable(mockUser))           // user query
      .mockImplementationOnce(() => createThenable([{ count: 5 }]))     // bookmark count
      .mockImplementationOnce(() => createThenable([{ count: 3 }]))     // comment count
      .mockImplementationOnce(() => createThenable([{ count: 2 }]))     // rating count

    const result = await getUserProfile('1')
    expect(result).toEqual(mockUser)
  })

  it('should update profile name', async () => {
    const { db } = await import('@/lib/db')
    const mockUser = { id: '1', name: 'New Name', email: 'test@example.com' }
    vi.mocked(db.update).mockImplementation(() => createThenable([mockUser]))

    const result = await updateProfile('1', { name: 'New Name' })
    expect(result.success).toBe(true)
    expect(result.user.name).toBe('New Name')
  })

  it('should track server view', async () => {
    const { db } = await import('@/lib/db')
    vi.mocked(db.insert).mockImplementation(() => createThenable([{}]))

    await trackServerView('user1', 'server1')
    expect(db.insert).toHaveBeenCalled()
  })
})
