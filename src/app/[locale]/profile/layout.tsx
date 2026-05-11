'use client'

import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import {
  User,
  MessageSquare,
  Star,
  History,
  Settings,
  Bookmark,
} from 'lucide-react'

const navItems = (locale: string) => [
  { href: `/${locale}/profile`, label: 'Профиль', icon: User },
  { href: `/${locale}/profile/bookmarks`, label: 'Закладки', icon: Bookmark },
  { href: `/${locale}/profile/comments`, label: 'Комментарии', icon: MessageSquare },
  { href: `/${locale}/profile/ratings`, label: 'Оценки', icon: Star },
  { href: `/${locale}/profile/history`, label: 'История', icon: History },
  { href: `/${locale}/profile/settings`, label: 'Настройки', icon: Settings },
]

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const params = useParams()
  const locale = (params?.locale as string) || 'ru'

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="space-y-1">
            {navItems(locale).map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
