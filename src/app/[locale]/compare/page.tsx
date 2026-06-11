import { getServersByIds } from '@/app/actions/public'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { ExternalLink } from "lucide-react"
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function ComparePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ ids?: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Compare' })
  const { ids } = await searchParams
  const serverIds = ids?.split(',').filter(Boolean) || []

  if (serverIds.length < 2) {
    return (
      <div className="page-shell text-center">
        <h1 className="font-heading text-3xl font-semibold tracking-[-0.05em] mb-4">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('selectMin')}
        </p>
        <Link href={`/${locale}/all`} className="text-primary hover:underline mt-4 inline-block">
          {t('goCatalog')}
        </Link>
      </div>
    )
  }

  const servers = await getServersByIds(serverIds)

  if (servers.length < 2) {
    notFound()
  }

  const fields = [
    { key: 'name', label: t('fieldName'), render: (s: any) => s.name },
    { key: 'category', label: t('fieldCategory'), render: (s: any) => <Badge>{s.category}</Badge> },
    { key: 'official', label: t('fieldOfficial'), render: (s: any) => s.isOfficial ? `✅ ${t('yes')}` : `❌ ${t('no')}` },
    { key: 'remote', label: t('fieldRemote'), render: (s: any) => s.isRemote ? `✅ ${t('yes')}` : `❌ ${t('no')}` },
    { key: 'stars', label: 'Stars', render: (s: any) => s.stars?.toLocaleString() || '—' },
    { key: 'forks', label: 'Forks', render: (s: any) => s.forks?.toLocaleString() || '—' },
    { key: 'tags', label: t('fieldTags'), render: (s: any) => s.tags.slice(0, 5).join(', ') || '—' },
    { key: 'description', label: t('fieldDescription'), render: (s: any) => s.description },
    { key: 'link', label: t('fieldGithub'), render: (s: any) => (
      <a href={s.githubUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
        {t('linkLabel')} <ExternalLink className="h-3 w-3" />
      </a>
    )},
  ]

  return (
    <div className="page-shell">
      <h1 className="font-heading text-3xl font-semibold tracking-[-0.05em] mb-6">{t('title')}</h1>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left p-3 border-b font-semibold min-w-[140px]">{t('characteristic')}</th>
              {servers.map((s: any) => (
                <th key={s.id} className="p-3 border-b text-left min-w-[200px]">
                  <Link href={`/${locale}/servers/${s.owner}/${s.repo}`} className="hover:underline">
                    {s.name}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields.map((field) => (
              <tr key={field.key} className="hover:bg-muted/50">
                <td className="p-3 border-b font-medium text-muted-foreground">{field.label}</td>
                {servers.map((s: any) => (
                  <td key={s.id} className="p-3 border-b">
                    {field.render(s)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
