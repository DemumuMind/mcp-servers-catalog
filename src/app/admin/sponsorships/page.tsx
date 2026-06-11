import { getSponsorships, deleteSponsorship } from '@/app/actions/sponsorships'
import { getServers } from '@/app/actions/servers'
import { SponsorshipForm } from '@/components/sponsorship-form'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Trash2 } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { getAdminTranslations } from '@/lib/admin-i18n'

export const dynamic = 'force-dynamic'

export default async function SponsorshipsPage() {
  const t = await getAdminTranslations('Admin.sponsorships')

  const [sponsorships, servers] = await Promise.all([
    getSponsorships(),
    getServers(),
  ])

  const availableServers = servers.filter((s) => !s.isSponsored)

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t('title')} description={t('description')} />

      <div className="bg-card rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">{t('newSponsorship')}</h2>
        <SponsorshipForm servers={availableServers} />
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('table.server')}</TableHead>
              <TableHead>{t('table.sponsor')}</TableHead>
              <TableHead>{t('table.period')}</TableHead>
              <TableHead>{t('table.amount')}</TableHead>
              <TableHead>{t('table.status')}</TableHead>
              <TableHead className="w-[100px]">{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sponsorships.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  {t('noActiveSponsorships')}
                </TableCell>
              </TableRow>
            ) : (
              sponsorships.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{s.server.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {s.server.owner}/{s.server.repo}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{s.sponsorName}</p>
                      {s.sponsorUrl && (
                        <a
                          href={s.sponsorUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {s.sponsorUrl}
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{new Date(s.startDate).toLocaleDateString()}</p>
                      {s.endDate && (
                        <p className="text-muted-foreground">
                          {t('until')} {new Date(s.endDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {s.amount ? (
                      <span>
                        {s.amount} {s.currency}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.active ? 'default' : 'secondary'}>
                      {s.active ? t('active') : t('inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <form
                      action={async () => {
                        'use server'
                        await deleteSponsorship(s.id)
                      }}
                    >
                      <Button type="submit" variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
