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

// Drizzle db mock — each method chain returns a thenable
const mockChain = (resolveValue: any) => ({
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  offset: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  returning: vi.fn().mockImplementation(() => Promise.resolve(resolveValue)),
  then: vi.fn().mockImplementation((onFulfilled: any) => Promise.resolve(resolveValue).then(onFulfilled)),
})

const createThenable = (resolveValue: any) => {
  const chain: any = {
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    onConflictDoUpdate: vi.fn().mockReturnThis(),
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
  notifications: {
    id: 'id',
    userId: 'userId',
    type: 'type',
    title: 'title',
    message: 'message',
    link: 'link',
    read: 'read',
    createdAt: 'createdAt',
  },
  comments: {
    id: 'id',
    isModerated: 'isModerated',
  },
}))

describe('Notification Actions', () => {
  it('should get user notifications', async () => {
    const { db } = await import('@/lib/db')
    const mockNotifications = [
      { id: '1', title: 'Test', message: 'Message', read: false, createdAt: new Date() },
    ]
    vi.mocked(db.select).mockImplementation(() => createThenable(mockNotifications))

    const result = await getUserNotifications('1')
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Test')
  })

  it('should count unread notifications', async () => {
    const { db } = await import('@/lib/db')
    vi.mocked(db.select).mockImplementation(() => createThenable([{ count: 5 }]))

    const result = await getUnreadNotificationsCount('1')
    expect(result).toBe(5)
  })

  it('should create notification', async () => {
    const { db } = await import('@/lib/db')
    const mockNotification = {
      id: '1',
      userId: '1',
      type: 'info',
      title: 'Test',
      message: 'Message',
      read: false,
    }
    vi.mocked(db.insert).mockImplementation(() => createThenable([mockNotification]))

    const result = await createNotification({
      userId: '1',
      type: 'info',
      title: 'Test',
      message: 'Message',
    })
    expect(result.title).toBe('Test')
  })
})
