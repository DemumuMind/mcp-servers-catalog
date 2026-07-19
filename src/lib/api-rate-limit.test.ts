import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getClientIPMock, rateLimitMock } = vi.hoisted(() => ({
  getClientIPMock: vi.fn(),
  rateLimitMock: vi.fn(),
}))

vi.mock('./rate-limit', () => ({
  getClientIP: getClientIPMock,
  rateLimit: rateLimitMock,
}))

import { apiRateLimit } from './api-rate-limit'

describe('apiRateLimit', () => {
  beforeEach(() => {
    getClientIPMock.mockReset()
    rateLimitMock.mockReset()
    getClientIPMock.mockResolvedValue('203.0.113.10')
    rateLimitMock.mockResolvedValue({
      success: true,
      limit: 30,
      remaining: 29,
      reset: Date.now() + 60_000,
    })
  })

  it('uses one rate limit bucket when query parameters change', async () => {
    const checkRateLimit = apiRateLimit({ maxRequests: 30, windowMs: 60_000 })

    await checkRateLimit(new Request('https://example.com/api/v1/search?q=first'))
    await checkRateLimit(new Request('https://example.com/api/v1/search?q=second'))

    expect(rateLimitMock).toHaveBeenNthCalledWith(
      1,
      'api:203.0.113.10:/api/v1/search',
      30,
      60_000
    )
    expect(rateLimitMock).toHaveBeenNthCalledWith(
      2,
      'api:203.0.113.10:/api/v1/search',
      30,
      60_000
    )
  })

  it('preserves an explicit identifier strategy', async () => {
    const checkRateLimit = apiRateLimit({
      maxRequests: 5,
      windowMs: 1_000,
      identifier: (request) => `custom:${new URL(request.url).searchParams.get('key')}`,
    })

    await checkRateLimit(new Request('https://example.com/api/v1/search?key=account-1'))

    expect(rateLimitMock).toHaveBeenCalledWith('custom:account-1', 5, 1_000)
  })
})
