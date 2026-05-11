'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
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
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/servers', label: 'Servers', icon: Server },
  { href: '/admin/clients', label: 'Clients', icon: Users },
  { href: '/admin/submissions', label: 'Submissions', icon: ClipboardList },
  { href: '/admin/moderation', label: 'Moderation', icon: MessageSquare },
  { href: '/admin/sponsorships', label: 'Sponsorships', icon: Megaphone },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/monitoring', label: 'Monitoring', icon: Activity },
  { href: '/admin/backup', label: 'Backup', icon: Database },
  { href: '/admin/users', label: 'Users', icon: Shield },
  { href: '/admin/audit-log', label: 'Audit Log', icon: ScrollText },
  { href: '/admin/time-series', label: 'Time Series', icon: TrendingUp },
  { href: '/admin/search-gaps', label: 'Search Gaps', icon: Search },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminNav({ email }: { email: string }) {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-muted border-r flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-bold text-lg">Admin Panel</h2>
        <p className="text-sm text-muted-foreground">{email}</p>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut className="h-4 w-4" />
          Выйти
        </Button>
      </div>
    </aside>
  )
}
