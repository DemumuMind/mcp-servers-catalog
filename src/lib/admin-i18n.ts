import { cookies } from 'next/headers'
import { getTranslations } from 'next-intl/server'

export async function getAdminTranslations(namespace: string) {
  const cookieStore = await cookies()
  const locale = cookieStore.get('admin-locale')?.value || 'en'
  const resolvedLocale = ['en', 'ru'].includes(locale) ? locale : 'en'
  return getTranslations({ locale: resolvedLocale, namespace })
}
