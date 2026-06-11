'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Bell, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { markNotificationAsRead, markAllNotificationsAsRead, getUnreadNotificationsCount, getLatestNotification } from '@/app/actions/notifications'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link?: string | null
  read: boolean
  createdAt: Date | string
}

interface NotificationsDropdownProps {
  notifications: Notification[]
  unreadCount: number
  userId: string
}

function useNotificationPolling(userId: string, initialNotifications: Notification[], initialUnreadCount: number) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount)
  const [hasNew, setHasNew] = useState(false)
  const prevCountRef = useRef(initialUnreadCount)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const addLatestIfNew = useCallback(async (count: number) => {
    const latest = await getLatestNotification(userId)
    if (latest) {
      setNotifications((prev) => {
        const exists = prev.find((n) => n.id === latest.id)
        return exists ? prev : [latest, ...prev].slice(0, 50)
      })
    }
    setUnreadCount(count)
    prevCountRef.current = count
  }, [userId])

  const poll = useCallback(async () => {
    try {
      const count = await getUnreadNotificationsCount(userId)
      if (count > prevCountRef.current) {
        setHasNew(true)
        await addLatestIfNew(count)
      } else {
        setUnreadCount(count)
        prevCountRef.current = count
      }
    } catch {
      // Silently ignore polling errors
    }
  }, [addLatestIfNew, userId])

  useEffect(() => {
    intervalRef.current = setInterval(poll, 30000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [poll])

  const markRead = async (id: string) => {
    await markNotificationAsRead(id, userId)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    setUnreadCount((prev) => Math.max(0, prev - 1))
    prevCountRef.current = Math.max(0, prevCountRef.current - 1)
  }

  const markAllRead = async () => {
    await markAllNotificationsAsRead(userId)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
    prevCountRef.current = 0
  }

  return { notifications, unreadCount, hasNew, setHasNew, markRead, markAllRead }
}

function NotificationItem({
  notification,
  onMarkAsRead,
}: {
  notification: Notification
  onMarkAsRead: (id: string) => void
}) {
  const t = useTranslations('Notifications')

  return (
    <div
      className={`rounded-xl p-3 text-sm transition-colors ${notification.read ? 'opacity-60' : 'bg-accent/45 ring-1 ring-primary/10'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{notification.title}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{notification.message}</p>
          {notification.link && (
            <a
              href={notification.link}
              className="mt-2 inline-flex text-xs font-semibold text-primary hover:underline"
              onClick={() => !notification.read && onMarkAsRead(notification.id)}
            >
              {t('goTo')}
            </a>
          )}
        </div>
        {!notification.read && (
          <button
            onClick={() => onMarkAsRead(notification.id)}
            className="shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Check className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  )
}

function DropdownPanel({
  notifications,
  unreadCount,
  onMarkAllAsRead,
  onMarkAsRead,
  onClose,
}: {
  notifications: Notification[]
  unreadCount: number
  onMarkAllAsRead: () => void
  onMarkAsRead: (id: string) => void
  onClose: () => void
}) {
  const t = useTranslations('Notifications')

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        role="presentation"
        onClick={onClose}
        onKeyUp={(e) => { if (e.key === "Escape") onClose() }}
      />
      <div className="absolute right-0 z-50 mt-2 max-h-96 w-84 overflow-y-auto rounded-2xl border border-border/70 bg-popover/96 p-2 shadow-[var(--shadow-premium)] backdrop-blur-2xl">
        <div className="mb-2 flex items-center justify-between border-b border-border/60 px-2 py-2">
          <span className="font-heading text-sm font-semibold tracking-[-0.03em]">{t('title')}</span>
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Check className="h-3 w-3" />
              {t('markAllRead')}
            </button>
          )}
        </div>
        {notifications.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {t('noNewNotifications')}
          </p>
        ) : (
          <div className="space-y-1">
            {notifications.map((n) => (
              <NotificationItem key={n.id} notification={n} onMarkAsRead={onMarkAsRead} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export function NotificationsDropdown({ notifications: initialNotifications, unreadCount: initialUnreadCount, userId }: NotificationsDropdownProps) {
  const t = useTranslations('Notifications')
  const [open, setOpen] = useState(false)
  const { notifications, unreadCount, hasNew, setHasNew, markRead, markAllRead } = useNotificationPolling(userId, initialNotifications, initialUnreadCount)

  const handleOpen = useCallback(() => {
    setOpen((prev) => !prev)
    setHasNew(false)
  }, [setHasNew])

  const bellButton = (
    <Button
      variant="ghost"
      size="icon-sm"
      className="relative"
      onClick={handleOpen}
      aria-label={t('ariaLabel')}
    >
      <Bell className={`${hasNew && !open ? 'animate-pulse text-primary' : ''}`} />
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 font-mono text-[10px] text-white">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
      {hasNew && unreadCount === 0 && (
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulse rounded-full bg-primary" />
      )}
    </Button>
  )

  if (!open) {
    return (
      <div className="relative">
        {bellButton}
      </div>
    )
  }

  return (
    <div className="relative">
      {bellButton}
      <DropdownPanel
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAllAsRead={markAllRead}
        onMarkAsRead={markRead}
        onClose={() => setOpen(false)}
      />
    </div>
  )
}
