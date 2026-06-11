import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Badges' })
  return {
    title: t('title'),
    description: t('description'),
  }
}

export const dynamic = 'force-dynamic' // revalidate = 86400

const BADGE_DEFS = [
  { type: 'default', label: 'MCP', queryParam: '', nameKey: 'badgeDefaultName', descKey: 'badgeDefaultDesc' },
  { type: 'stars', label: 'Stars', queryParam: 'type=stars', nameKey: 'badgeStarsName', descKey: 'badgeStarsDesc' },
  { type: 'official', label: 'MCP', queryParam: 'type=official', nameKey: 'badgeOfficialName', descKey: 'badgeOfficialDesc' },
  { type: 'category', label: 'Category', queryParam: 'type=category', nameKey: 'badgeCategoryName', descKey: 'badgeCategoryDesc' },
] as const

function buildBadgeUrl(baseUrl: string, type: string, queryParam: string) {
  const query = queryParam ? `?${queryParam}` : ''
  return {
    example: (locale: string) => `[![${type}](${baseUrl}/api/badge/owner/repo${query})](${baseUrl}/${locale}/servers/owner/repo)`,
    preview: `${baseUrl}/api/badge/anthropics/anthropic${query}`,
  }
}

export default async function BadgesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Badges' })
  const baseUrl = process.env.SITE_URL || 'https://mcpservers.org'

  const badges = BADGE_DEFS.map((def) => {
    const urls = buildBadgeUrl(baseUrl, def.label, def.queryParam)
    return {
      type: def.type,
      name: t(def.nameKey),
      description: t(def.descKey),
      example: urls.example(locale),
      preview: urls.preview,
    }
  })

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-heading text-4xl font-semibold tracking-[-0.06em] mb-4">
        {t('title')}
      </h1>
      <p className="text-muted-foreground mb-8">
        {t('description')}
      </p>

      <div className="space-y-8">
        {badges.map((badge) => (
          <div key={badge.type} className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">{badge.name}</h2>
            <p className="text-muted-foreground mb-4">{badge.description}</p>

            {/* Badge preview */}
            <div className="mb-4 flex items-center gap-3 rounded-2xl bg-card/80 border border-border/60 p-4">
              <span className="text-xs text-muted-foreground">{t('preview')}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={badge.preview}
                alt={`${badge.name} badge`}
                className="h-5"
              />
            </div>

            <div className="rounded-2xl bg-muted/70 border border-border/60 p-4 mb-4">
              <code className="text-sm font-mono block whitespace-pre-wrap break-all">{badge.example}</code>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
        <p className="text-sm">
          <strong>{t('replacePrefix')}</strong> <code>owner/repo</code>{' '}
          {t('replaceMiddle')} <code>anthropics/anthropic</code>{' '}
          {t('replaceSuffix')}{' '}
          <code>/api/badge/anthropics/anthropic</code>.
        </p>
      </div>
    </div>
  )
}
