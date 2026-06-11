'use server'

import { db, auditLogs, users } from '@/lib/db'
import { eq, desc } from 'drizzle-orm'
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

    await db.insert(auditLogs).values({
      userId: userId || null,
      action,
      targetType: targetType || null,
      targetId: targetId || null,
      details: details ? JSON.stringify(details) : null,
      ip,
      userAgent,
    })
  } catch (error) {
    // Audit logging should never break the main flow
    console.error('Audit log error:', error)
  }
}

export async function getAuditLogs(limit = 100, offset = 0) {
  return db.select({
    id: auditLogs.id,
    userId: auditLogs.userId,
    action: auditLogs.action,
    targetType: auditLogs.targetType,
    targetId: auditLogs.targetId,
    details: auditLogs.details,
    ip: auditLogs.ip,
    userAgent: auditLogs.userAgent,
    createdAt: auditLogs.createdAt,
    user: {
      name: users.name,
      email: users.email,
    },
  }).from(auditLogs).leftJoin(users, eq(auditLogs.userId, users.id)).orderBy(desc(auditLogs.createdAt)).limit(limit).offset(offset)
}

export async function getAuditLogsByAction(action: string, limit = 50) {
  return db.select({
    id: auditLogs.id,
    userId: auditLogs.userId,
    action: auditLogs.action,
    targetType: auditLogs.targetType,
    targetId: auditLogs.targetId,
    details: auditLogs.details,
    ip: auditLogs.ip,
    userAgent: auditLogs.userAgent,
    createdAt: auditLogs.createdAt,
    user: {
      name: users.name,
      email: users.email,
    },
  }).from(auditLogs).leftJoin(users, eq(auditLogs.userId, users.id)).where(eq(auditLogs.action, action)).orderBy(desc(auditLogs.createdAt)).limit(limit)
}
