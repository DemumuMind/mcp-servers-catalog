'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { BrandLockup } from '@/components/brand'
import { AdminLocaleSwitcher } from '@/components/admin/admin-locale-switcher'
import {
  LayoutDashboard,
  Server,
  Users,
  ClipboardList,
  LogOut,
  Database,
  Settings,
  Shield,
  BarChart3,
  Megaphone,
  MessageSquare,
  Activity,
  ScrollText,
  Search,
  TrendingUp,
} from 'lucide-react'

const navItems = [
  { href: '/admin', labelKey: 'dashboard', icon: LayoutDashboard },
  { href: '/admin/servers', labelKey: 'servers', icon: Server },
  { href: '/admin/clients', labelKey: 'clients', icon: Users },
  { href: '/admin/submissions', labelKey: 'submissions', icon: ClipboardList },
  { href: '/admin/moderation', labelKey: 'moderation', icon: MessageSquare },
  { href: '/admin/sponsorships', labelKey: 'sponsorships', icon: Megaphone },
  { href: '/admin/analytics', labelKey: 'analytics', icon: BarChart3 },
  { href: '/admin/monitoring', labelKey: 'monitoring', icon: Activity },
  { href: '/admin/backup', labelKey: 'backup', icon: Database },
  { href: '/admin/users', labelKey: 'users', icon: Shield },
  { href: '/admin/audit-log', labelKey: 'auditLog', icon: ScrollText },
  { href: '/admin/time-series', labelKey: 'timeSeries', icon: TrendingUp },
  { href: '/admin/search-gaps', labelKey: 'searchGaps', icon: Search },
  { href: '/admin/settings', labelKey: 'settings', icon: Settings },
]

export function AdminNav({ email: _email }: { email: string }) {
  const pathname = usePathname()
  const t = useTranslations('Admin.nav')

  return (
    <aside className="flex h-dvh w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar/92 shadow-[var(--shadow-soft)] backdrop-blur-2xl">
      <div className="border-b border-sidebar-border p-5">
        <Link href="/admin" className="flex items-center gap-3">
          <BrandLockup markSize={46} subtitle={t('brandSubtitle')} />
        </Link>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(`${item.href}/`))
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-sidebar-foreground/68 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-ring',
                isActive && 'bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_16px_34px_-24px_var(--primary)] hover:bg-sidebar-primary hover:text-sidebar-primary-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {t(item.labelKey)}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-sidebar-border p-4 space-y-3">
        <AdminLocaleSwitcher />
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut className="h-4 w-4" />
          {t('signOut')}
        </Button>
      </div>
    </aside>
  )
}
