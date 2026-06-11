import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { BrandLockup } from '@/components/brand'

interface FooterProps {
  locale: string
}

export async function Footer({ locale }: FooterProps) {
  const t = await getTranslations({ locale, namespace: 'Navigation' })
  const tFooter = await getTranslations({ locale, namespace: 'Footer' })

  return (
    <footer className="mt-16 border-t border-border/30">
      <div className="mx-auto max-w-screen-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="premium-panel overflow-hidden">
          {/* Top row: brand + links */}
          <div className="flex flex-col gap-8 p-6 sm:p-8 md:flex-row md:items-start md:justify-between">
            {/* Brand cluster */}
            <div className="max-w-xs">
              <BrandLockup markSize={40} subtitle={tFooter('brandSubtitle')} />
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground/80">
                {tFooter('description')}
              </p>
            </div>

            {/* Links grid */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 text-sm font-semibold text-muted-foreground/75">
              <Link href={`/${locale}/all`} className="transition-colors hover:text-foreground">{t('all')}</Link>
              <Link href={`/${locale}/official`} className="transition-colors hover:text-foreground">{t('official')}</Link>
              <Link href={`/${locale}/clients`} className="transition-colors hover:text-foreground">{t('clients')}</Link>
              <Link href={`/${locale}/guide`} className="transition-colors hover:text-foreground">{tFooter('guide')}</Link>
              <span className="mx-1 h-4 w-px bg-border/50" />
              <Link
                href={`/${locale}/submit`}
                className="inline-flex items-center gap-1 text-primary transition-colors hover:text-primary/80"
              >
                {t('submit')} <ArrowUpRight className="size-3" />
              </Link>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-border/30 px-6 py-4 sm:px-8">
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground/50">
                &copy; {new Date().getFullYear()} MCP Servers
              </p>
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.26em] text-primary/40">
                MCPSERVERS.ORG
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
