import { getUserProfile } from '@/app/actions/profile'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SettingsPageClient from '@/components/settings-page-client'

export const dynamic = 'force-dynamic'

export default async function ProfileSettingsPage({
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

  return (
    <SettingsPageClient
      user={{
        id: session.user.id,
        name: profile.name,
        email: profile.email,
        emailNotifications: profile.emailNotifications,
      }}
      locale={locale}
    />
  )
}
