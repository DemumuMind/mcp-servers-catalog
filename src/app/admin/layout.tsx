import { auth } from '@/lib/auth'
import AdminLoginForm from '@/components/admin-login-form'
import { AdminNav } from '@/components/admin-nav'
import { NextIntlClientProvider } from 'next-intl'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user || session.user.role !== 'admin') {
    return (
      <div className="min-h-screen">
        <NextIntlClientProvider messages={{}} locale="en">
          <AdminLoginForm />
        </NextIntlClientProvider>
      </div>
    )
  }

  // Read admin locale from cookie, default to 'en'
  const cookieStore = await cookies()
  const adminLocale = cookieStore.get('admin-locale')?.value || 'en'
  const resolvedLocale = ['en', 'ru'].includes(adminLocale) ? adminLocale : 'en'

  const messages = (await import(`../../../messages/${resolvedLocale}.json`)).default

  return (
    <NextIntlClientProvider messages={messages} locale={resolvedLocale}>
      <div className="flex min-h-screen bg-background/80">
        <AdminNav email={session.user.email ?? ''} />
        <main className="min-w-0 flex-1 overflow-auto">
          <div className="mx-auto max-w-screen-2xl space-y-8 p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </NextIntlClientProvider>
  )
}
