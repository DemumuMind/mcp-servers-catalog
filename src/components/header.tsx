import { HeaderClient } from '@/components/header-client'

interface HeaderProps {
  locale: string
  session?: {
    user?: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
    } | null
  } | null
  notifications?: Array<{
    id: string
    type: string
    title: string
    message: string
    link?: string | null
    read: boolean
    createdAt: Date | string
  }>
  unreadCount?: number
}

export function Header({ locale, session, notifications = [], unreadCount = 0 }: HeaderProps) {
  return (
    <HeaderClient
      locale={locale}
      user={session?.user ?? null}
      notifications={notifications.map((notification) => ({
        ...notification,
        createdAt: notification.createdAt instanceof Date ? notification.createdAt.toISOString() : notification.createdAt,
      }))}
      unreadCount={unreadCount}
    />
  )
}
