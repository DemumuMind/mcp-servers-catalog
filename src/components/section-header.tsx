import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

interface SectionHeaderProps {
  title: string
  href: string
  locale?: string
  showLink?: boolean
}

export async function SectionHeader({ title, href, locale = 'en', showLink = true }: SectionHeaderProps) {
  const t = await getTranslations({ locale, namespace: 'SectionHeader' })

  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <p className="eyebrow mb-2">{t('eyebrow')}</p>
        <h2 className="font-heading text-2xl font-semibold tracking-[-0.05em] sm:text-3xl">{title}</h2>
      </div>
      {showLink && (
        <Link
          href={href}
          className="group inline-flex items-center gap-1 rounded-2xl border border-border/70 bg-card/58 px-3 py-2 text-sm font-semibold text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary"
        >
          {t('showAll')}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  )
}
