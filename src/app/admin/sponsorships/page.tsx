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

export const dynamic = 'force-dynamic'

export default async function SponsorshipsPage() {
  const [sponsorships, servers] = await Promise.all([
    getSponsorships(),
    getServers(),
  ])

  const availableServers = servers.filter((s) => !s.isSponsored)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Спонсорские места</h1>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Новое спонсорство</h2>
        <SponsorshipForm servers={availableServers} />
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Сервер</TableHead>
              <TableHead>Спонсор</TableHead>
              <TableHead>Период</TableHead>
              <TableHead>Сумма</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="w-[100px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sponsorships.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Нет активных спонсорств
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
                      <p>{new Date(s.startDate).toLocaleDateString('ru-RU')}</p>
                      {s.endDate && (
                        <p className="text-muted-foreground">
                          до {new Date(s.endDate).toLocaleDateString('ru-RU')}
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
                      {s.active ? 'Активно' : 'Неактивно'}
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
