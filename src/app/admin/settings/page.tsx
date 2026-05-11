'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteTitle: 'Awesome MCP Servers',
    siteDescription: 'Коллекция серверов для Model Context Protocol',
    siteUrl: 'https://mcpservers.org',
    googleAnalytics: '',
    yandexMetrika: '',
  })

  const handleSave = () => {
    // Save to localStorage for now (in production: API call)
    localStorage.setItem('siteSettings', JSON.stringify(settings))
    alert('Настройки сохранены!')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>SEO Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Site Title</label>
              <Input
                value={settings.siteTitle}
                onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Site Description</label>
              <Textarea
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Site URL</label>
              <Input
                value={settings.siteUrl}
                onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
              />
            </div>
            <Button onClick={handleSave}>Сохранить SEO</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Google Analytics ID</label>
              <Input
                placeholder="G-XXXXXXXXXX"
                value={settings.googleAnalytics}
                onChange={(e) => setSettings({ ...settings, googleAnalytics: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Yandex Metrika ID</label>
              <Input
                placeholder="XXXXXXXX"
                value={settings.yandexMetrika}
                onChange={(e) => setSettings({ ...settings, yandexMetrika: e.target.value })}
              />
            </div>
            <Button onClick={handleSave}>Сохранить Analytics</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cache Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Очистка кэша Next.js и данных.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.clear()
                  alert('LocalStorage очищен!')
                }}
              >
                Очистить LocalStorage
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if ('caches' in window) {
                    caches.keys().then((names) => {
                      names.forEach((name) => caches.delete(name))
                      alert('Cache API очищен!')
                    })
                  }
                }}
              >
                Очистить Cache API
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Moderation Queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Настройки модерации.
            </p>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                <span className="text-sm">Автоматическая модерация</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                <span className="text-sm">Email уведомления</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                <span className="text-sm">Требовать Premium для Featured</span>
              </label>
            </div>
            <Button onClick={handleSave}>Сохранить настройки</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
