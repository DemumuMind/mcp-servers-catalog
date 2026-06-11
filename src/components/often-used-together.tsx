import { getTranslations } from 'next-intl/server'
import { ServerCard } from '@/components/server-card'
import { Users } from 'lucide-react'

interface OftenUsedTogetherProps {
  servers: Array<{
    id: string
    name: string
    owner: string
    repo: string
    description: string
    isOfficial: boolean
    isSponsored: boolean
    tags: string[]
    category: string
    stars: number
    forks: number
    togetherCount: number
  }>
  locale: string
}

export async function OftenUsedTogether({ servers, locale }: OftenUsedTogetherProps) {
  const t = await getTranslations({ locale, namespace: 'OftenUsed' })

  if (servers.length === 0) return null

  return (
    <div className="mt-12">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">{t('title')}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {servers.map((server) => (
          <ServerCard
            key={server.id}
            server={server}
            locale={locale}
          />
        ))}
      </div>
    </div>
  )
}
