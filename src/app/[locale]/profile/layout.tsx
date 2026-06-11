'use client'

import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { User, MessageSquare, Star, History, Settings, Bookmark } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

const navItems = (locale: string) => [
  { href: `/${locale}/profile`, labelKey: 'profile', icon: User },
  { href: `/${locale}/profile/bookmarks`, labelKey: 'bookmarks', icon: Bookmark },
  { href: `/${locale}/profile/comments`, labelKey: 'comments', icon: MessageSquare },
  { href: `/${locale}/profile/ratings`, labelKey: 'ratings', icon: Star },
  { href: `/${locale}/profile/history`, labelKey: 'history', icon: History },
  { href: `/${locale}/profile/settings`, labelKey: 'settings', icon: Settings },
]

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const params = useParams()
  const locale = (params?.locale as string) || 'ru'
  const t = useTranslations('ProfileNav')

  return (
    <div className="page-shell">
      <div className="grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <nav className="premium-panel grid gap-1 p-2">
            {navItems(locale).map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors',
                    isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {t(item.labelKey)}
                </Link>
              )
            })}
          </nav>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  )
}
