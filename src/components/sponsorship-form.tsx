'use client'

import { useState } from 'react'
import { createSponsorship } from '@/app/actions/sponsorships'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Server {
  id: string
  name: string
  owner: string
  repo: string
}

export function SponsorshipForm({ servers }: { servers: Server[] }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setSuccess(false)

    const serverId = formData.get('serverId') as string
    const sponsorName = formData.get('sponsorName') as string
    const sponsorUrl = formData.get('sponsorUrl') as string
    const amount = parseFloat(formData.get('amount') as string) || undefined
    const endDate = formData.get('endDate') as string

    await createSponsorship({
      serverId,
      sponsorName,
      sponsorUrl: sponsorUrl || undefined,
      amount,
      endDate: endDate ? new Date(endDate) : undefined,
    })

    setLoading(false)
    setSuccess(true)
  }

  if (servers.length === 0) {
    return (
      <p className="text-muted-foreground">
        Нет доступных серверов для спонсорства. Все серверы уже спонсируются.
      </p>
    )
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="serverId">Сервер</Label>
          <Select name="serverId" required>
            <SelectTrigger>
              <SelectValue placeholder="Выберите сервер" />
            </SelectTrigger>
            <SelectContent>
              {servers.map((server) => (
                <SelectItem key={server.id} value={server.id}>
                  {server.name} ({server.owner}/{server.repo})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sponsorName">Название спонсора</Label>
          <Input
            id="sponsorName"
            name="sponsorName"
            placeholder="Компания-спонсор"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sponsorUrl">URL спонсора</Label>
          <Input
            id="sponsorUrl"
            name="sponsorUrl"
            type="url"
            placeholder="https://sponsor.example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Сумма (USD)</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">Дата окончания</Label>
          <Input id="endDate" name="endDate" type="date" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Создание...' : 'Создать спонсорство'}
        </Button>
        {success && (
          <span className="text-sm text-green-600">Спонсорство создано!</span>
        )}
      </div>
    </form>
  )
}
