import { describe, it, expect } from 'vitest'
import { formatDistanceToNow } from '@/lib/date-utils'

describe('formatDistanceToNow', () => {
  it('returns "только что" for very recent dates', () => {
    const now = new Date()
    expect(formatDistanceToNow(now)).toBe('только что')
  })

  it('returns seconds for dates within a minute', () => {
    const date = new Date(Date.now() - 30 * 1000)
    expect(formatDistanceToNow(date)).toBe('30 сек. назад')
  })

  it('returns minutes for dates within an hour', () => {
    const date = new Date(Date.now() - 5 * 60 * 1000)
    expect(formatDistanceToNow(date)).toBe('5 мин. назад')
  })

  it('returns hours for dates within a day', () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000)
    expect(formatDistanceToNow(date)).toBe('3 ч. назад')
  })

  it('returns days for older dates', () => {
    const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    expect(formatDistanceToNow(date)).toBe('2 дн. назад')
  })
})
