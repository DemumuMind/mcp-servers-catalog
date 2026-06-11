import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic' // revalidate = 86400

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'AboutMcp' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    keywords: t('metaKeywords').split(', '),
    openGraph: {
      title: t('metaTitle'),
      description: t('ogDescription'),
      type: 'article',
      locale: locale === 'ru' ? 'ru_RU' : 'en_US',
    },
  }
}

export default async function AboutMCPPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'AboutMcp' })

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <article className="prose dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-6">{t('h1')}</h1>
        
        <p className="text-lg text-muted-foreground mb-8">
          {t('intro')}
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t('whyMcpTitle')}</h2>
        <p>
          {t('whyMcpP1')}
        </p>
        <p>
          {t('whyMcpP2')}
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t('howMcpTitle')}</h2>
        <div className="rounded-2xl bg-muted/70 border border-border/60 p-6 my-6">
          <h3 className="text-lg font-medium mb-3">{t('architectureTitle')}</h3>
          <ul className="space-y-2">
            <li>{t('archServer')}</li>
            <li>{t('archClient')}</li>
            <li>{t('archTransport')}</li>
          </ul>
        </div>

        <p>
          {t('capabilitiesIntro')}
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>{t('capTools')}</li>
          <li>{t('capResources')}</li>
          <li>{t('capPrompts')}</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t('examplesTitle')}</h2>
        <div className="grid gap-4 my-6">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">{t('exampleDbTitle')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('exampleDbDesc')}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">{t('exampleDocsTitle')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('exampleDocsDesc')}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">{t('exampleInfraTitle')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('exampleInfraDesc')}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">{t('exampleFilesTitle')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('exampleFilesDesc')}
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t('securityTitle')}</h2>
        <p>
          {t('securityIntro')}
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>{t('secConfirm')}</li>
          <li>{t('secGranular')}</li>
          <li>{t('secAuth')}</li>
          <li>{t('secIsolation')}</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t('startTitle')}</h2>
        <p>
          {t('startCtaPrefix')}{' '}
          <a href={`/${locale}/guide`} className="text-primary hover:underline">{t('startCtaGuideLink')}</a>{' '}
          {t('startCtaMiddle')}{' '}
          <a href={`/${locale}/all`} className="text-primary hover:underline">{t('startCtaCatalogLink')}</a>.
        </p>
      </article>
    </div>
  )
}
