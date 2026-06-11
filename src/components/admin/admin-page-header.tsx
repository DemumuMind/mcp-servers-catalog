import type { ReactNode } from 'react'
import { useTranslations } from 'next-intl'

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}) {
  const t = useTranslations('Admin')
  return (
    <div className="premium-panel flex flex-wrap items-center justify-between gap-4 p-6">
      <div>
        <p className="eyebrow mb-2">{eyebrow ?? t('eyebrow')}</p>
        <h1 className="font-heading text-4xl font-semibold tracking-[-0.06em]">{title}</h1>
        {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
