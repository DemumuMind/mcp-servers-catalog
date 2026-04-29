import Link from 'next/link'
import { GitBranch } from 'lucide-react'

interface FooterProps {
  locale: string
}

export function Footer({ locale }: FooterProps) {
  return (
    <footer className="border-t bg-muted/50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <GitBranch className="h-4 w-4" />
            <span>Awesome MCP Servers</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href={`/${locale}/all`} className="hover:text-foreground transition-colors">
              Все серверы
            </Link>
            <Link href={`/${locale}/official`} className="hover:text-foreground transition-colors">
              Официальные
            </Link>
            <Link href={`/${locale}/clients`} className="hover:text-foreground transition-colors">
              Клиенты
            </Link>
            <Link href={`/${locale}/submit`} className="hover:text-foreground transition-colors">
              Добавить
            </Link>
          </nav>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Awesome MCP
          </p>
        </div>
      </div>
    </footer>
  )
}
