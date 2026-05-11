'use server'

import { prisma } from '@/lib/db'
import { recordHealthCheck } from './health-checks'

export async function checkServerStatus(serverId: string) {
  const server = await prisma.server.findUnique({
    where: { id: serverId },
    select: { endpoint: true, isRemote: true },
  })

  if (!server?.isRemote || !server.endpoint) {
    return { status: 'unknown', message: 'Not a remote server' }
  }

  const startTime = Date.now()

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(server.endpoint, {
      method: 'HEAD',
      signal: controller.signal,
    })

    clearTimeout(timeout)
    const latency = Date.now() - startTime

    const status = response.ok ? 'online' : 'degraded'
    await recordHealthCheck(serverId, status, latency)

    return {
      status,
      statusCode: response.status,
      latency,
      message: response.ok ? 'Server is online' : `HTTP ${response.status}`,
    }
  } catch (error: any) {
    const latency = Date.now() - startTime
    const status = error.name === 'AbortError' ? 'timeout' : 'offline'
    await recordHealthCheck(serverId, status, latency, error.message)

    return {
      status,
      latency,
      message: error.name === 'AbortError' ? 'Request timed out' : 'Server unreachable',
    }
  }
}
