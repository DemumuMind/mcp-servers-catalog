'use server'

import { prisma } from '@/lib/db'
import { headers } from 'next/headers'

export async function logAudit(
  action: string,
  targetType?: string,
  targetId?: string,
  details?: Record<string, unknown>,
  userId?: string
) {
  try {
    const h = await headers()
    const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
    const userAgent = h.get('user-agent') || 'unknown'

    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        targetType: targetType || null,
        targetId: targetId || null,
        details: details ? JSON.stringify(details) : null,
        ip,
        userAgent,
      },
    })
  } catch (error) {
    // Audit logging should never break the main flow
    console.error('Audit log error:', error)
  }
}

export async function getAuditLogs(limit = 100, offset = 0) {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
    include: {
      user: { select: { name: true, email: true } },
    },
  })
}

export async function getAuditLogsByAction(action: string, limit = 50) {
  return prisma.auditLog.findMany({
    where: { action },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      user: { select: { name: true, email: true } },
    },
  })
}
