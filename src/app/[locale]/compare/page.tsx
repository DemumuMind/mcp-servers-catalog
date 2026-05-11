import { getServersByIds } from '@/app/actions/public'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Star, GitFork, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ComparePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ ids?: string }>
}) {
  const { locale } = await params
  const { ids } = await searchParams
  const serverIds = ids?.split(',').filter(Boolean) || []

  if (serverIds.length < 2) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Сравнение серверов</h1>
        <p className="text-muted-foreground">
          Выберите минимум 2 сервера для сравнения. Добавьте ?ids=id1,id2 в URL.
        </p>
        <Link href={`/${locale}/all`} className="text-primary hover:underline mt-4 inline-block">
          Перейти к каталогу
        </Link>
      </div>
    )
  }

  const servers = await getServersByIds(serverIds)

  if (servers.length < 2) {
    notFound()
  }

  const fields = [
    { key: 'name', label: 'Название', render: (s: any) => s.name },
    { key: 'category', label: 'Категория', render: (s: any) => <Badge>{s.category}</Badge> },
    { key: 'official', label: 'Официальный', render: (s: any) => s.isOfficial ? '✅ Да' : '❌ Нет' },
    { key: 'remote', label: 'Remote', render: (s: any) => s.isRemote ? '✅ Да' : '❌ Нет' },
    { key: 'stars', label: 'Stars', render: (s: any) => s.stars?.toLocaleString() || '—' },
    { key: 'forks', label: 'Forks', render: (s: any) => s.forks?.toLocaleString() || '—' },
    { key: 'tags', label: 'Теги', render: (s: any) => s.tags.slice(0, 5).join(', ') || '—' },
    { key: 'description', label: 'Описание', render: (s: any) => s.description },
    { key: 'link', label: 'GitHub', render: (s: any) => (
      <a href={s.githubUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
        Ссылка <ExternalLink className="h-3 w-3" />
      </a>
    )},
  ]

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Сравнение серверов</h1>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left p-3 border-b font-semibold min-w-[140px]">Характеристика</th>
              {servers.map((s) => (
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
                {servers.map((s) => (
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
