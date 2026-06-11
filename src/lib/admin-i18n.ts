import { cookies, headers } from 'next/headers'
import { getTranslations } from 'next-intl/server'

function parseAcceptLanguage(acceptLanguage: string): string {
  const languages = acceptLanguage
    .split(',')
    .map((lang) => {
      const [code, qStr] = lang.trim().split(';q=')
      const quality = qStr ? parseFloat(qStr) : 1
      return { code: code.split('-')[0].toLowerCase(), quality }
    })
    .sort((a, b) => b.quality - a.quality)

  for (const lang of languages) {
    if (['en', 'ru'].includes(lang.code)) {
      return lang.code
    }
  }
  return 'en'
}

export async function getAdminTranslations(namespace: string) {
  const cookieStore = await cookies()
  const headerList = await headers()

  const cookieLocale = cookieStore.get('admin-locale')?.value
  const acceptLanguage = headerList.get('accept-language') || ''

  let locale = cookieLocale || parseAcceptLanguage(acceptLanguage)
  const resolvedLocale = ['en', 'ru'].includes(locale) ? locale : 'en'
  return getTranslations({ locale: resolvedLocale, namespace })
}
