import Link from 'next/link'
import { GitBranch } from 'lucide-react'

interface HeaderProps {
  locale: string
}

export function Header({ locale }: HeaderProps) {
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
        </nav>
      </div>
    </header>
  )
}
