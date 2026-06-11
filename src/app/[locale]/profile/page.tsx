import { getUserProfile } from '@/app/actions/profile'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { User, Bookmark, MessageSquare, Star, Calendar, Settings, Send } from 'lucide-react'
import Link from 'next/link'
import { AuthorAnalytics } from '@/components/author-analytics'
import { Button } from '@/components/ui/button'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Profile' })
  const session = await auth()

  if (!session?.user?.id) redirect(`/${locale}/login`)

  const profile = await getUserProfile(session.user.id)
  if (!profile) redirect(`/${locale}`)

  const stats = [
    { label: t('bookmarks'), value: profile._count.bookmarks, icon: Bookmark, href: `/${locale}/profile/bookmarks` },
    { label: t('comments'), value: profile._count.comments, icon: MessageSquare, href: `/${locale}/profile/comments` },
    { label: t('ratings'), value: profile._count.ratings, icon: Star, href: `/${locale}/profile/ratings` },
  ]

  return (
    <div className="space-y-8">
      <section className="premium-panel p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-18 items-center justify-center rounded-3xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <User className="size-9" />
            </div>
            <div>
              <p className="eyebrow mb-2">{t('eyebrow')}</p>
              <h1 className="font-heading text-4xl font-semibold tracking-[-0.06em]">{profile.name || t('defaultName')}</h1>
              <p className="mt-2 text-muted-foreground">{profile.email}</p>
              <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {t('memberSince', { date: new Date(profile.createdAt).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US') })}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" render={<Link href={`/${locale}/profile/settings`} />}><Settings className="size-4" /> {t('edit')}</Button>
            <Button render={<Link href={`/${locale}/submit`} />}><Send className="size-4" /> {t('addServer')}</Button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.label} href={stat.href} className="premium-card flex items-center gap-4 p-5">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-heading text-3xl font-semibold tracking-[-0.05em]" data-numeric>{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </Link>
          )
        })}
      </div>

      <section className="premium-panel p-5 sm:p-6">
        <h2 className="font-heading text-2xl font-semibold tracking-[-0.05em]">{t('analyticsTitle')}</h2>
        <div className="mt-5"><AuthorAnalytics userId={session.user.id} /></div>
      </section>
    </div>
  )
}
