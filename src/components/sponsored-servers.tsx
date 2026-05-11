import { getActiveSponsoredServers } from '@/app/actions/sponsorships'
import { ServerCard } from './server-card'

export async function SponsoredServers() {
  const sponsorships = await getActiveSponsoredServers()

  if (sponsorships.length === 0) return null

  return (
    <section className="py-8">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-2xl font-bold">Спонсорские серверы</h2>
        <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-0.5 rounded">
          Реклама
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sponsorships.map((s) => (
          <ServerCard
            key={s.server.id}
            server={{
              ...s.server,
              isSponsored: true,
            }}
            locale="ru"
          />
        ))}
      </div>
    </section>
  )
}
