type LocaleKey = 'ru' | 'en'

const strings: Record<LocaleKey, {
  justNow: string
  secondsAgo: (n: number) => string
  minutesAgo: (n: number) => string
  hoursAgo: (n: number) => string
  daysAgo: (n: number) => string
  monthsAgo: (n: number) => string
  yearsAgo: (n: number) => string
}> = {
  ru: {
    justNow: 'только что',
    secondsAgo: (n) => `${n} сек. назад`,
    minutesAgo: (n) => `${n} мин. назад`,
    hoursAgo: (n) => `${n} ч. назад`,
    daysAgo: (n) => `${n} дн. назад`,
    monthsAgo: (n) => `${n} мес. назад`,
    yearsAgo: (n) => `${n} г. назад`,
  },
  en: {
    justNow: 'just now',
    secondsAgo: (n) => `${n}s ago`,
    minutesAgo: (n) => `${n}m ago`,
    hoursAgo: (n) => `${n}h ago`,
    daysAgo: (n) => `${n}d ago`,
    monthsAgo: (n) => `${n}mo ago`,
    yearsAgo: (n) => `${n}y ago`,
  },
}

export function formatDistanceToNow(date: Date, locale: string = 'ru'): string {
  const loc: LocaleKey = locale === 'en' ? 'en' : 'ru'
  const s = strings[loc]

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffMonth = Math.floor(diffDay / 30)
  const diffYear = Math.floor(diffDay / 365)

  if (diffSec < 10) return s.justNow
  if (diffSec < 60) return s.secondsAgo(diffSec)
  if (diffMin < 60) return s.minutesAgo(diffMin)
  if (diffHour < 24) return s.hoursAgo(diffHour)
  if (diffDay < 30) return s.daysAgo(diffDay)
  if (diffMonth < 12) return s.monthsAgo(diffMonth)
  return s.yearsAgo(diffYear)
}
