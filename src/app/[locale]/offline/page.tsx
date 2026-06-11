import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Offline' })
  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function OfflinePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Offline' })

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-6xl mb-4">📡</div>
      <h1 className="font-heading text-3xl font-semibold tracking-[-0.05em] mb-2">{t('title')}</h1>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        {t('description')}
      </p>
      <a
        href={`/${locale || 'ru'}`}
        className="rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {t('retry')}
      </a>
    </div>
  )
}
