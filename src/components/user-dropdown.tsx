'use client'

import { useState } from 'react'
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
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <Button
        variant="ghost"
        className="flex items-center gap-2 h-9 px-2"
        onClick={() => setOpen(!open)}
      >
        <Avatar className="h-7 w-7">
          <AvatarImage src={user.image || undefined} />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <span className="text-sm hidden sm:inline">{user.name || user.email}</span>
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-56 rounded-md border bg-popover shadow-lg z-50 p-1">
            <div className="px-3 py-2 text-sm font-medium border-b mb-1">
              {user.name || user.email}
            </div>
            <Link
              href={`/${locale}/profile`}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-sm hover:bg-accent"
              onClick={() => setOpen(false)}
            >
              <User className="h-4 w-4" />
              Профиль
            </Link>
            <Link
              href={`/${locale}/profile/bookmarks`}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-sm hover:bg-accent"
              onClick={() => setOpen(false)}
            >
              <Bookmark className="h-4 w-4" />
              Мои закладки
            </Link>
            <Link
              href={`/${locale}/profile/settings`}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-sm hover:bg-accent"
              onClick={() => setOpen(false)}
            >
              <Settings className="h-4 w-4" />
              Настройки
            </Link>
            <button
              className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-sm hover:bg-accent text-red-600"
              onClick={() => {
                setOpen(false)
                signOut({ callbackUrl: `/${locale}` })
              }}
            >
              <LogOut className="h-4 w-4" />
              Выйти
            </button>
          </div>
        </>
      )}
    </div>
  )
}
