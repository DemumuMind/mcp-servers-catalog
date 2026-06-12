'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserDropdown } from '@/components/user-dropdown'
import { NotificationsDropdown } from '@/components/notifications-dropdown'
import { LocaleSwitcher } from '@/components/locale-switcher'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { BrandLockup } from '@/components/brand'

interface HeaderClientProps {
  locale: string
  user?: {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
  } | null
  notifications?: Array<{
    id: string
    type: string
    title: string
    message: string
    link?: string | null
    read: boolean
    createdAt: Date | string
  }>
  unreadCount?: number
}

const navKeys = ['all', 'official', 'clients', 'guide'] as const

export function HeaderClient({ locale, user, notifications = [], unreadCount = 0 }: HeaderClientProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const t = useTranslations('Navigation')
  const tBrand = useTranslations('Brand')

  return (
    <header className="glass-nav sticky top-0 z-40">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href={`/${locale}`} className="group flex items-center gap-3 transition-opacity hover:opacity-85" onClick={() => setMobileOpen(false)}>
          <BrandLockup markSize={38} subtitle={tBrand('subtitle')} />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 lg:flex" aria-label={t('mainNav')}>
          {navKeys.map((key) => {
            const href = `/${locale}/${key}`
            const active = pathname === href || pathname?.startsWith(`${href}/`)
            return (
              <Link
                key={key}
                href={href}
                className={cn(
                  'relative rounded-xl px-3.5 py-1.5 text-[0.82rem] font-semibold text-muted-foreground/80 transition-all duration-200 hover:bg-muted/50 hover:text-foreground',
                  active && 'text-foreground'
                )}
              >
                {t(key)}
                {active && (
                  <span className="absolute inset-x-2 -bottom-1 h-0.5 rounded-full bg-primary/70" />
                )}
              </Link>
            )
          })}

          {/* Separator */}
          <span className="mx-2 h-5 w-px bg-border/50" />

          {/* Submit as CTA pill */}
          <Link
            href={`/${locale}/submit`}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary/90 to-primary px-4 py-1.5 text-[0.82rem] font-bold text-primary-foreground shadow-[0_0_12px_-3px_var(--color-primary)/30] transition-all duration-200 hover:shadow-[0_0_18px_-3px_var(--color-primary)/45] hover:brightness-110',
              (pathname === `/${locale}/submit`) && 'brightness-110 shadow-[0_0_18px_-3px_var(--color-primary)/45]'
            )}
          >
            <Sparkles className="size-3.5" />
            {t('submit')}
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1.5 md:flex">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
          {user ? (
            <>
              <NotificationsDropdown
                notifications={notifications}
                unreadCount={unreadCount}
                userId={user.id!}
              />
              <UserDropdown user={user} locale={locale} />
            </>
          ) : (
            <Link href={`/${locale}/login`} className="hidden sm:inline-flex">
              <Button variant="outline" size="sm" className="rounded-full border-border/60 px-4 font-semibold">
                {t('login')}
              </Button>
            </Link>
          )}
          <Button
            variant="outline"
            size="icon-sm"
            className="lg:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-label={t('openMenu')}
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-border/60 bg-background/92 px-4 py-4 backdrop-blur-2xl lg:hidden">
          <nav className="mx-auto grid max-w-screen-2xl gap-1.5" aria-label={t('mobileNav')}>
            {navKeys.map((key) => {
              const href = `/${locale}/${key}`
              const active = pathname === href || pathname?.startsWith(`${href}/`)
              return (
                <Link
                  key={key}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'rounded-2xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                    active && 'bg-primary/10 text-primary'
                  )}
                >
                  {t(key)}
                </Link>
              )
            })}
            <Link
              href={`/${locale}/submit`}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'mt-1 inline-flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-primary/90 to-primary px-4 py-3 text-sm font-bold text-primary-foreground',
                (pathname === `/${locale}/submit`) && 'from-primary to-primary'
              )}
            >
              <Sparkles className="size-3.5" />
              {t('submit')}
            </Link>
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
              <LocaleSwitcher />
              <ThemeToggle />
              {!user && (
                <Link href={`/${locale}/login`} onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="sm" className="rounded-full">{t('login')}</Button>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
