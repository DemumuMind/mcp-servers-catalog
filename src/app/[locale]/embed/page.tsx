import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getSiteUrl } from '@/lib/site-url'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Embed' })
  return {
    title: t('title'),
    description: t('description'),
  }
}

export const dynamic = 'force-dynamic'

export default async function EmbedPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Embed' })
  const baseUrl = getSiteUrl()

  const exampleCode = `<iframe
  src="${baseUrl}/api/embed?id=SERVER_ID"
  width="100%"
  height="160"
  frameborder="0"
  style="border-radius: 8px; overflow: hidden;"
></iframe>`

  const scriptCode = `<script
  src="${baseUrl}/embed.js"
  data-server-id="SERVER_ID"
  data-width="100%"
  data-height="160"
></script>`

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-heading text-4xl font-semibold tracking-[-0.06em] mb-4">{t('title')}</h1>
      <p className="text-muted-foreground mb-8">
        {t('description')}
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">{t('method1Iframe')}</h2>
          <p className="text-sm text-muted-foreground mb-3">
            {t('method1Desc')}
          </p>
          <div className="rounded-2xl bg-muted/70 border border-border/60 p-4">
            <code className="text-sm font-mono block whitespace-pre">{exampleCode}</code>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('method2Js')}</h2>
          <p className="text-sm text-muted-foreground mb-3">
            {t('method2Desc')}
          </p>
          <div className="rounded-2xl bg-muted/70 border border-border/60 p-4">
            <code className="text-sm font-mono block whitespace-pre">{scriptCode}</code>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('whereId')}</h2>
          <p className="text-muted-foreground">
            {t('whereIdDescPrefix')}{' '}
            <code>/servers/</code>. {t('whereIdDescMiddle')}{' '}
            <code>{getSiteUrl()}/ru/servers/anthropics/anthropic</code>
            {' '}{t('whereIdDescSuffix')}
          </p>
        </section>
      </div>
    </div>
  )
}
