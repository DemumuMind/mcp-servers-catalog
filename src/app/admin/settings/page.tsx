'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { getSiteUrl } from '@/lib/site-url'

export default function SettingsPage() {
  const t = useTranslations('Admin.settings')

  const [settings, setSettings] = useState({
    siteTitle: 'Awesome MCP Servers',
    siteDescription: 'Collection of servers for Model Context Protocol',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || getSiteUrl(),
    googleAnalytics: '',
    yandexMetrika: '',
  })

  const handleSave = () => {
    localStorage.setItem('siteSettings', JSON.stringify(settings))
    alert(t('settingsSaved'))
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader title={t('title')} description={t('description')} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('seoSettings')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="site-title" className="text-sm font-medium">{t('siteTitle')}</label>
              <Input id="site-title" value={settings.siteTitle} onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label htmlFor="site-description" className="text-sm font-medium">{t('siteDescription')}</label>
              <Textarea id="site-description" value={settings.siteDescription} onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })} rows={3} />
            </div>
            <div className="space-y-2">
              <label htmlFor="site-url" className="text-sm font-medium">{t('siteUrl')}</label>
              <Input id="site-url" value={settings.siteUrl} onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })} />
            </div>
            <Button onClick={handleSave}>{t('saveSEO')}</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('analyticsCard')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="ga-id" className="text-sm font-medium">{t('googleAnalyticsId')}</label>
              <Input id="ga-id" placeholder="G-XXXXXXXXXX" value={settings.googleAnalytics} onChange={(e) => setSettings({ ...settings, googleAnalytics: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label htmlFor="ym-id" className="text-sm font-medium">{t('yandexMetrikaId')}</label>
              <Input id="ym-id" placeholder="XXXXXXXX" value={settings.yandexMetrika} onChange={(e) => setSettings({ ...settings, yandexMetrika: e.target.value })} />
            </div>
            <Button onClick={handleSave}>{t('saveAnalytics')}</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('cacheManagement')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('cacheDescription')}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.clear()
                  alert(t('localStorageCleared'))
                }}
              >
                {t('clearLocalStorage')}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if ('caches' in window) {
                    caches.keys().then((names) => {
                      names.forEach((name) => caches.delete(name))
                      alert(t('cacheApiCleared'))
                    })
                  }
                }}
              >
                {t('clearCacheApi')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('moderationQueue')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('moderationSettings')}
            </p>
            <div className="space-y-2">
              <label htmlFor="auto-moderation" className="flex items-center gap-2">
                <input id="auto-moderation" type="checkbox" aria-label={t('automaticModeration')} defaultChecked />
                <span className="text-sm">{t('automaticModeration')}</span>
              </label>
              <label htmlFor="email-notifications-admin" className="flex items-center gap-2">
                <input id="email-notifications-admin" type="checkbox" aria-label={t('emailNotifications')} defaultChecked />
                <span className="text-sm">{t('emailNotifications')}</span>
              </label>
              <label htmlFor="premium-featured" className="flex items-center gap-2">
                <input id="premium-featured" type="checkbox" aria-label={t('requirePremiumForFeatured')} />
                <span className="text-sm">{t('requirePremiumForFeatured')}</span>
              </label>
            </div>
            <Button onClick={handleSave}>{t('saveSettings')}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
