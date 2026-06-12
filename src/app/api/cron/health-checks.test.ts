// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

let verifyCronAuthMock = vi.fn().mockReturnValue(null)

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))

vi.mock('@/lib/cron-auth', () => ({
  verifyCronAuth: (...args: any[]) => verifyCronAuthMock(...args),
}))

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn().mockImplementation(() => createChain([])),
    insert: vi.fn().mockImplementation(() => createChain([])),
    update: vi.fn().mockImplementation(() => createChain([])),
    delete: vi.fn().mockImplementation(() => createChain([])),
  },
}))

vi.mock('@/lib/db/schema', () => ({
  servers: { id: 'id', name: 'name', isRemote: 'isRemote', healthStatus: 'healthStatus', lastHealthCheck: 'lastHealthCheck', healthCheckUrl: 'healthCheckUrl' },
  healthChecks: { id: 'id', serverId: 'serverId', status: 'status', responseTime: 'responseTime', checkedAt: 'checkedAt', error: 'error' },
}))

vi.mock('@/app/actions/health', () => ({
  checkServerHealth: vi.fn().mockResolvedValue({ status: 'healthy', responseTime: 150 }),
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn().mockReturnValue({}),
  and: vi.fn().mockReturnValue({}),
  desc: vi.fn().mockReturnValue({}),
  sql: vi.fn().mockReturnValue({}),
}))

const createChain = (resolveValue: any) => {
  const chain: Record<string, any> = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    returning: vi.fn().mockImplementation(() => Promise.resolve(resolveValue)),
  }
  chain.then = (onFulfilled: any) => Promise.resolve(resolveValue).then(onFulfilled)
  return chain
}

describe('Health Checks Cron Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    verifyCronAuthMock = vi.fn().mockReturnValue(null)
  })

  it('returns 401 without CRON_SECRET', async () => {
    verifyCronAuthMock = vi.fn().mockReturnValue(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    )

    const { GET } = await import('@/app/api/cron/health-checks/route')
    const req = new NextRequest('http://localhost/api/cron/health-checks')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('rejects unauthenticated requests with 401', async () => {
    verifyCronAuthMock = vi.fn().mockReturnValue(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    )
    const { GET } = await import('@/app/api/cron/health-checks/route')
    const req = new NextRequest('http://localhost/api/cron/health-checks')
    const res = await GET(req)
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data).toHaveProperty('error')
  })
})
