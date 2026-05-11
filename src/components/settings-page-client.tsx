'use client'

import { useState } from 'react'
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
      setMessage('Имя обновлено')
    } catch (err) {
      setError('Ошибка обновления имени')
    }
    setLoading(false)
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')
    setError('')
    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают')
      return
    }
    if (newPassword.length < 6) {
      setError('Пароль должен быть не менее 6 символов')
      return
    }
    setLoading(true)
    try {
      await updatePassword(user.id, currentPassword, newPassword)
      setMessage('Пароль изменён')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setError(err.message || 'Ошибка смены пароля')
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
      setMessage('Настройки сохранены')
    } catch (err) {
      setError('Ошибка сохранения настроек')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5" />
        <h1 className="text-xl font-bold">Настройки</h1>
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
          Профиль
        </h2>
        <form onSubmit={handleUpdateProfile} className="space-y-3 max-w-md">
          <div>
            <label className="text-sm font-medium mb-1 block">Email</label>
            <Input value={user.email} disabled className="bg-muted" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Имя</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Сохранение...' : 'Сохранить имя'}
          </Button>
        </form>
      </section>

      {/* Password */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Смена пароля
        </h2>
        <form onSubmit={handleUpdatePassword} className="space-y-3 max-w-md">
          <div>
            <label className="text-sm font-medium mb-1 block">Текущий пароль</label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Новый пароль</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Подтвердите новый пароль</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Смена...' : 'Сменить пароль'}
          </Button>
        </form>
      </section>

      {/* Notifications */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Уведомления
        </h2>
        <form onSubmit={handleUpdateSettings} className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <div>
              <div className="text-sm font-medium">Email-уведомления</div>
              <div className="text-xs text-muted-foreground">
                Получать уведомления о статусе заявок и ответах на комментарии
              </div>
            </div>
          </label>
          <Button type="submit" disabled={loading}>
            {loading ? 'Сохранение...' : 'Сохранить настройки'}
          </Button>
        </form>
      </section>
    </div>
  )
}
