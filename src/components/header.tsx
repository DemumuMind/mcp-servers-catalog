import Link from 'next/link'
import { GitBranch } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserDropdown } from '@/components/user-dropdown'
import { NotificationsDropdown } from '@/components/notifications-dropdown'
import { LocaleSwitcher } from '@/components/locale-switcher'
import { Button } from '@/components/ui/button'

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
    createdAt: Date
  }>
  unreadCount?: number
}

export function Header({ locale, session, notifications = [], unreadCount = 0 }: HeaderProps) {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-2 font-bold text-lg">
          <GitBranch className="h-5 w-5" />
          <span>Awesome MCP</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href={`/${locale}/all`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Все серверы
          </Link>
          <Link href={`/${locale}/official`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Официальные
          </Link>
          <Link href={`/${locale}/clients`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Клиенты
          </Link>
          <Link href={`/${locale}/submit`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Отправить
          </Link>
          <div className="flex items-center gap-3 ml-2">
            <LocaleSwitcher />
            <ThemeToggle />
            
            {session?.user ? (
              <>
                <NotificationsDropdown
                  notifications={notifications}
                  unreadCount={unreadCount}
                  userId={session.user.id!}
                />
                <UserDropdown user={session.user} locale={locale} />
              </>
            ) : (
              <Link href={`/${locale}/login`}>
                <Button variant="outline" size="sm">
                  Войти
                </Button>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
