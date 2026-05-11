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

vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    comment: {
      findMany: vi.fn(),
    },
    rating: {
      findMany: vi.fn(),
    },
    viewHistory: {
      findMany: vi.fn(),
      upsert: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}))

describe('Profile Actions', () => {
  it('should get user profile', async () => {
    const { prisma } = await import('@/lib/db')
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      createdAt: new Date(),
      emailNotifications: true,
      _count: { bookmarks: 5, comments: 3, ratings: 2 },
    }
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any)

    const result = await getUserProfile('1')
    expect(result).toEqual(mockUser)
  })

  it('should update profile name', async () => {
    const { prisma } = await import('@/lib/db')
    const mockUser = { id: '1', name: 'New Name', email: 'test@example.com' }
    vi.mocked(prisma.user.update).mockResolvedValue(mockUser as any)

    const result = await updateProfile('1', { name: 'New Name' })
    expect(result.success).toBe(true)
    expect(result.user.name).toBe('New Name')
  })

  it('should track server view', async () => {
    const { prisma } = await import('@/lib/db')
    vi.mocked(prisma.viewHistory.upsert).mockResolvedValue({} as any)

    await trackServerView('user1', 'server1')
    expect(prisma.viewHistory.upsert).toHaveBeenCalled()
  })
})
