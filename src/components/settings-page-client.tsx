'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { updateProfile, updatePassword, updateSettings } from '@/app/actions/profile'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Settings, User, Lock, Bell, Check } from 'lucide-react'

interface SettingsPageProps {
  user: {
    id: string
    name: string | null
    email: string
    emailNotifications: boolean
  }
  locale: string
}

export default function SettingsPageClient({ user }: SettingsPageProps) {
  const t = useTranslations('Settings')
  const [name, setName] = useState(user.name || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [emailNotifications, setEmailNotifications] = useState(user.emailNotifications)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')
    try {
      await updateProfile(user.id, { name })
      setMessage(t('profileUpdated'))
    } catch (_err) {
      setError(t('profileUpdateError'))
    }
    setLoading(false)
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')
    setError('')
    if (newPassword !== confirmPassword) {
      setError(t('passwordsMismatch'))
      return
    }
    if (newPassword.length < 6) {
      setError(t('passwordTooShort'))
      return
    }
    setLoading(true)
    try {
      await updatePassword(user.id, currentPassword, newPassword)
      setMessage(t('passwordChanged'))
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setError(err.message || t('passwordChangeError'))
    }
    setLoading(false)
  }

  async function handleUpdateSettings(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')
    try {
      await updateSettings(user.id, { emailNotifications })
      setMessage(t('settingsSaved'))
    } catch (_err) {
      setError(t('settingsSaveError'))
    }
    setLoading(false)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5" />
        <h1 className="text-xl font-bold">{t('title')}</h1>
      </div>

      {message && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-green-50 text-green-700 text-sm">
          <Check className="h-4 w-4" />
          {message}
        </div>
      )}
      {error && (
        <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      {/* Profile Info */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <User className="h-4 w-4" />
          {t('profileSection')}
        </h2>
        <form onSubmit={handleUpdateProfile} className="space-y-3 max-w-md">
          <div>
            <label htmlFor="settings-email" className="text-sm font-medium mb-1 block">Email</label>
            <Input id="settings-email" value={user.email} disabled className="bg-muted" />
          </div>
          <div>
            <label htmlFor="user-name" className="text-sm font-medium mb-1 block">{t('nameLabel')}</label>
            <Input id="user-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? t('saving') : t('saveName')}
          </Button>
        </form>
      </section>

      {/* Password */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Lock className="h-4 w-4" />
          {t('passwordSection')}
        </h2>
        <form onSubmit={handleUpdatePassword} className="space-y-3 max-w-md">
          <div>
            <label htmlFor="current-password" className="text-sm font-medium mb-1 block">{t('currentPassword')}</label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="new-password" className="text-sm font-medium mb-1 block">{t('newPassword')}</label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="text-sm font-medium mb-1 block">{t('confirmPassword')}</label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? t('changing') : t('changePassword')}
          </Button>
        </form>
      </section>

      {/* Notifications */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Bell className="h-4 w-4" />
          {t('notificationsSection')}
        </h2>
        <form onSubmit={handleUpdateSettings} className="space-y-3">
          <label htmlFor="email-notifications" aria-label={t('emailNotifications')} className="flex items-center gap-3 cursor-pointer">
            <input
              id="email-notifications"
              type="checkbox"
              aria-label={t('emailNotifications')}
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <div>
              <div className="text-sm font-medium">{t('emailNotifications')}</div>
              <div className="text-xs text-muted-foreground">
                {t('emailNotificationsDescription')}
              </div>
            </div>
          </label>
          <Button type="submit" disabled={loading}>
            {loading ? t('saving') : t('saveSettings')}
          </Button>
        </form>
      </section>
    </div>
  )
}
