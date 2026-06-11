'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Bookmark, LogOut, User, Settings } from 'lucide-react'

interface UserDropdownProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  locale: string
}

export function UserDropdown({ user, locale }: UserDropdownProps) {
  const t = useTranslations('UserDropdown')
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <Button
        variant="outline"
        className="flex h-10 items-center gap-2 rounded-2xl px-2 pr-3"
        onClick={() => setOpen(!open)}
      >
        <Avatar className="h-7 w-7 rounded-xl">
          <AvatarImage src={user.image || undefined} className="rounded-xl" />
          <AvatarFallback className="rounded-xl">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <span className="hidden max-w-36 truncate text-sm sm:inline">{user.name || user.email}</span>
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" role="presentation" onClick={() => setOpen(false)} onKeyUp={(e) => { if (e.key === "Escape") setOpen(false) }} />
          <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-border/70 bg-popover/96 p-2 shadow-[var(--shadow-premium)] backdrop-blur-2xl">
            <div className="mb-1 border-b border-border/60 px-3 py-3 text-sm">
              <p className="font-semibold">{user.name || t('defaultUser')}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
            <Link
              href={`/${locale}/profile`}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium hover:bg-accent/70"
              onClick={() => setOpen(false)}
            >
              <User className="h-4 w-4" />
              {t('profile')}
            </Link>
            <Link
              href={`/${locale}/profile/bookmarks`}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium hover:bg-accent/70"
              onClick={() => setOpen(false)}
            >
              <Bookmark className="h-4 w-4" />
              {t('myBookmarks')}
            </Link>
            <Link
              href={`/${locale}/profile/settings`}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium hover:bg-accent/70"
              onClick={() => setOpen(false)}
            >
              <Settings className="h-4 w-4" />
              {t('settings')}
            </Link>
            <button
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
              onClick={() => {
                setOpen(false)
                signOut({ callbackUrl: `/${locale}` })
              }}
            >
              <LogOut className="h-4 w-4" />
              {t('signOut')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
