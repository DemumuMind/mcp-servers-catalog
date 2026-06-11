'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations('Admin.sponsorships.form')

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
        {t('noServersAvailable')}
      </p>
    )
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="serverId">{t('server')}</Label>
          <Select name="serverId" required>
            <SelectTrigger>
              <SelectValue placeholder={t('selectServer')} />
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
          <Label htmlFor="sponsorName">{t('sponsorName')}</Label>
          <Input
            id="sponsorName"
            name="sponsorName"
            placeholder={t('sponsorNamePlaceholder')}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sponsorUrl">{t('sponsorUrl')}</Label>
          <Input
            id="sponsorUrl"
            name="sponsorUrl"
            type="url"
            placeholder={t('sponsorUrlPlaceholder')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">{t('amount')}</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder={t('amountPlaceholder')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">{t('endDate')}</Label>
          <Input id="endDate" name="endDate" type="date" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? t('creating') : t('createSponsorship')}
        </Button>
        {success && (
          <span className="text-sm text-green-600">{t('sponsorshipCreated')}</span>
        )}
      </div>
    </form>
  )
}
