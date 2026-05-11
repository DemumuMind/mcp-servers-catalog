import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale = (locale as string) || 'ru'
  const messages = (await import(`./messages/${resolvedLocale}.json`)).default

  return {
    locale: resolvedLocale,
    messages,
    timeZone: 'Europe/Moscow',
    now: new Date(),
  }
})
