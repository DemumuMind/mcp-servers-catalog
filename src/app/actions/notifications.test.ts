import { describe, it, expect, vi } from 'vitest'
import {
  getUserNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createNotification,
} from '@/app/actions/notifications'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  prisma: {
    notification: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      create: vi.fn(),
    },
  },
}))

describe('Notification Actions', () => {
  it('should get user notifications', async () => {
    const { prisma } = await import('@/lib/db')
    const mockNotifications = [
      { id: '1', title: 'Test', message: 'Message', read: false, createdAt: new Date() },
    ]
    vi.mocked(prisma.notification.findMany).mockResolvedValue(mockNotifications as any)

    const result = await getUserNotifications('1')
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Test')
  })

  it('should count unread notifications', async () => {
    const { prisma } = await import('@/lib/db')
    vi.mocked(prisma.notification.count).mockResolvedValue(5)

    const result = await getUnreadNotificationsCount('1')
    expect(result).toBe(5)
  })

  it('should create notification', async () => {
    const { prisma } = await import('@/lib/db')
    const mockNotification = {
      id: '1',
      userId: '1',
      type: 'info',
      title: 'Test',
      message: 'Message',
      read: false,
    }
    vi.mocked(prisma.notification.create).mockResolvedValue(mockNotification as any)

    const result = await createNotification({
      userId: '1',
      type: 'info',
      title: 'Test',
      message: 'Message',
    })
    expect(result.title).toBe('Test')
  })
})
