import Link from 'next/link'
import { GitBranch } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <GitBranch className="h-5 w-5" />
          <span>Awesome MCP</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/all" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Все серверы
          </Link>
          <Link href="/official" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Официальные
          </Link>
          <Link href="/clients" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Клиенты
          </Link>
          <Link href="/submit" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Добавить
          </Link>
        </nav>
      </div>
    </header>
  )
}
