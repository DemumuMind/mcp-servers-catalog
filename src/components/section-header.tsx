import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface SectionHeaderProps {
  title: string
  href: string
}

export function SectionHeader({ title, href }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <Link
        href={href}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Показать все
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}
