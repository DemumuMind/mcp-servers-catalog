import { getUserProfile } from '@/app/actions/profile'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { User, Bookmark, MessageSquare, Star, Calendar } from 'lucide-react'
import Link from 'next/link'
import { AuthorAnalytics } from '@/components/author-analytics'

export const dynamic = 'force-dynamic'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect(`/${locale}/login`)
  }

  const profile = await getUserProfile(session.user.id)

  if (!profile) {
    redirect(`/${locale}`)
  }

  const stats = [
    {
      label: 'Закладки',
      value: profile._count.bookmarks,
      icon: Bookmark,
      href: `/${locale}/profile/bookmarks`,
    },
    {
      label: 'Комментарии',
      value: profile._count.comments,
      icon: MessageSquare,
      href: `/${locale}/profile/comments`,
    },
    {
      label: 'Оценки',
      value: profile._count.ratings,
      icon: Star,
      href: `/${locale}/profile/ratings`,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{profile.name || 'Пользователь'}</h1>
          <p className="text-muted-foreground">{profile.email}</p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <Calendar className="h-3 w-3" />
            На сайте с {new Date(profile.createdAt).toLocaleDateString('ru-RU')}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Links */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Быстрые действия</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/${locale}/profile/settings`}
            className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
          >
            Редактировать профиль
          </Link>
          <Link
            href={`/${locale}/submit`}
            className="inline-flex items-center px-4 py-2 rounded-md border text-sm font-medium hover:bg-accent"
          >
            Добавить сервер
          </Link>
        </div>
      </div>

      {/* Author Analytics */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Аналитика ваших серверов</h2>
        <AuthorAnalytics userId={session.user.id} />
      </div>
    </div>
  )
}
