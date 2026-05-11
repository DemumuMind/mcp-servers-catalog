'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { markNotificationAsRead, markAllNotificationsAsRead, getUnreadNotificationsCount, getLatestNotification } from '@/app/actions/notifications'
import { useRouter } from 'next/navigation'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link?: string | null
  read: boolean
  createdAt: Date
}

interface NotificationsDropdownProps {
  notifications: Notification[]
  unreadCount: number
  userId: string
}

export function NotificationsDropdown({ notifications: initialNotifications, unreadCount: initialUnreadCount, userId }: NotificationsDropdownProps) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount)
  const [hasNew, setHasNew] = useState(false)
  const router = useRouter()
  const prevCountRef = useRef(initialUnreadCount)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Polling every 30 seconds for unread count
  useEffect(() => {
    const poll = async () => {
      try {
        const count = await getUnreadNotificationsCount(userId)
        if (count > prevCountRef.current) {
          setHasNew(true)
          // Fetch latest notification to show in dropdown
          const latest = await getLatestNotification(userId)
          if (latest) {
            setNotifications((prev) => {
              const exists = prev.find((n) => n.id === latest.id)
              if (exists) return prev
              return [latest, ...prev].slice(0, 50)
            })
          }
        }
        setUnreadCount(count)
        prevCountRef.current = count
      } catch {
        // Silently ignore polling errors
      }
    }

    intervalRef.current = setInterval(poll, 30000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [userId])

  // Clear "new" pulse when dropdown opened
  const handleOpen = useCallback(() => {
    setOpen((prev) => {
      if (!prev) {
        setHasNew(false)
      }
      return !prev
    })
  }, [])

  async function handleMarkAsRead(id: string) {
    await markNotificationAsRead(id, userId)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
    prevCountRef.current = Math.max(0, prevCountRef.current - 1)
  }

  async function handleMarkAllAsRead() {
    await markAllNotificationsAsRead(userId)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
    prevCountRef.current = 0
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={handleOpen}
      >
        <Bell className={`h-4 w-4 ${hasNew && !open ? 'animate-pulse text-primary' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        {hasNew && unreadCount === 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
        )}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 rounded-md border bg-popover shadow-lg z-50 p-2 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between px-2 py-1 border-b mb-2">
              <span className="text-sm font-medium">Уведомления</span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <Check className="h-3 w-3" />
                  Все прочитаны
                </button>
              )}
            </div>
            
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Нет уведомлений
              </p>
            ) : (
              <div className="space-y-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2 rounded-sm text-sm ${n.read ? 'opacity-60' : 'bg-accent/50'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{n.title}</p>
                        <p className="text-xs text-muted-foreground">{n.message}</p>
                        {n.link && (
                          <a
                            href={n.link}
                            className="text-xs text-primary hover:underline"
                            onClick={() => !n.read && handleMarkAsRead(n.id)}
                          >
                            Перейти
                          </a>
                        )}
                      </div>
                      {!n.read && (
                        <button
                          onClick={() => handleMarkAsRead(n.id)}
                          className="shrink-0 text-muted-foreground hover:text-foreground"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
