import * as React from 'react'
import { SearchX, type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface PageShellProps extends React.ComponentProps<'div'> {
  wide?: boolean
}

export function PageShell({ className, wide = true, ...props }: PageShellProps) {
  return (
    <div
      className={cn(
        'page-shell',
        !wide && 'max-w-5xl',
        className
      )}
      {...props}
    />
  )
}

interface PageHeroProps extends Omit<React.ComponentProps<'section'>, 'title'> {
  eyebrow?: string
  title: React.ReactNode
  description?: React.ReactNode
  align?: 'left' | 'center'
  actions?: React.ReactNode
  children?: React.ReactNode
}

export function PageHero({
  eyebrow,
  title,
  description,
  align = 'left',
  actions,
  children,
  className,
  ...props
}: PageHeroProps) {
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/72 px-5 py-8 shadow-[var(--shadow-soft)] backdrop-blur-xl sm:px-8 lg:px-10 lg:py-10',
        align === 'center' && 'text-center',
        className
      )}
      {...props}
    >
      <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-primary/14 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-8 h-64 w-64 rounded-full bg-chart-2/10 blur-3xl" />
      <div className={cn('relative z-10 max-w-4xl', align === 'center' && 'mx-auto')}>
        {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
        <h1 className="font-heading text-4xl font-semibold leading-[1.02] tracking-[-0.055em] text-foreground sm:text-5xl lg:text-[3.45rem]">
          {title}
        </h1>
        {description && (
          <div className={cn('mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg', align === 'center' && 'mx-auto')}>
            {description}
          </div>
        )}
        {actions && <div className={cn('mt-7 flex flex-wrap gap-3', align === 'center' && 'justify-center')}>{actions}</div>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  )
}

export function FilterPanel({ className, ...props }: React.ComponentProps<'section'>) {
  return <section className={cn('premium-panel p-4 sm:p-5', className)} {...props} />
}

interface MetricCardProps extends React.ComponentProps<'div'> {
  label: string
  value: React.ReactNode
  icon?: LucideIcon
  hint?: React.ReactNode
}

export function MetricCard({ label, value, icon: Icon, hint, className, ...props }: MetricCardProps) {
  return (
    <div className={cn('premium-card p-5', className)} {...props}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className="mt-2 font-heading text-3xl font-semibold tracking-[-0.05em]" data-numeric>
            {value}
          </div>
        </div>
        {Icon && (
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <Icon className="size-5" />
          </div>
        )}
      </div>
      {hint && <div className="mt-3 text-sm text-muted-foreground">{hint}</div>}
    </div>
  )
}

interface EmptyStateProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  icon?: LucideIcon
  title: React.ReactNode
  description?: React.ReactNode
  actionLabel?: string
  actionHref?: string
}

export function EmptyState({
  icon: Icon = SearchX,
  title,
  description,
  actionLabel,
  actionHref,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div className={cn('premium-panel flex flex-col items-center justify-center px-6 py-14 text-center', className)} {...props}>
      <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
        <Icon className="size-7" />
      </div>
      <h2 className="font-heading text-2xl font-semibold tracking-[-0.04em]">{title}</h2>
      {description && <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">{description}</p>}
      {actionLabel && actionHref && (
        <Button className="mt-6" render={<a href={actionHref} aria-label={actionLabel} />}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}


