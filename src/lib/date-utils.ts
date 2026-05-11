export function formatDistanceToNow(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffMonth = Math.floor(diffDay / 30)
  const diffYear = Math.floor(diffDay / 365)

  if (diffSec < 10) return 'только что'
  if (diffSec < 60) return `${diffSec} сек. назад`
  if (diffMin < 60) return `${diffMin} мин. назад`
  if (diffHour < 24) return `${diffHour} ч. назад`
  if (diffDay < 30) return `${diffDay} дн. назад`
  if (diffMonth < 12) return `${diffMonth} мес. назад`
  return `${diffYear} г. назад`
}
