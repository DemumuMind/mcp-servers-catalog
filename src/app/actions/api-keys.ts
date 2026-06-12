'use server'

import { db, apiKeys } from '@/lib/db'
import { eq, and, desc } from 'drizzle-orm'
import { randomBytes, createHash } from 'crypto'
import { revalidatePath } from 'next/cache'

function generateApiKey(): string {
  return 'mcp_' + randomBytes(32).toString('hex')
}

function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

export async function createApiKey(
  userId: string,
  name: string,
  permissions: string[] = ['read']
): Promise<{ success: boolean; key?: string; apiKey?: { id: string; name: string; prefix: string; permissions: string[]; createdAt: Date } }> {
  try {
    const key = generateApiKey()
    const keyHash = hashKey(key)
    const keyPrefix = key.slice(0, 8)

    const apiKey = await db.insert(apiKeys).values({
      userId,
      name,
      keyHash,
      keyPrefix,
      permissions,
    }).returning().then((r: any) => r[0])

    revalidatePath('/profile/api-keys')

    return {
      success: true,
      key,
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        prefix: apiKey.keyPrefix,
        permissions: apiKey.permissions,
        createdAt: apiKey.createdAt,
      },
    }
  } catch (error) {
    console.error('Failed to create API key:', error)
    return { success: false }
  }
}

export async function listApiKeys(userId: string): Promise<Array<{
  id: string
  name: string
  keyPrefix: string
  permissions: string[]
  lastUsedAt: Date | null
  createdAt: Date
  revoked: boolean
}>> {
  try {
    const keys = await db.select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      permissions: apiKeys.permissions,
      lastUsedAt: apiKeys.lastUsedAt,
      createdAt: apiKeys.createdAt,
      revoked: apiKeys.revoked,
    }).from(apiKeys).where(and(eq(apiKeys.userId, userId), eq(apiKeys.revoked, false))).orderBy(desc(apiKeys.createdAt))

    return keys
  } catch (error) {
    console.error('Failed to list API keys:', error)
    return []
  }
}

export async function revokeApiKey(userId: string, keyId: string): Promise<{ success: boolean }> {
  try {
    await db.update(apiKeys).set({ revoked: true }).where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)))

    revalidatePath('/profile/api-keys')
    return { success: true }
  } catch (error) {
    console.error('Failed to revoke API key:', error)
    return { success: false }
  }
}

export async function validateApiKey(
  key: string,
  requiredPermission?: string
): Promise<{
  valid: boolean
  userId?: string
  permissions?: string[]
}> {
  try {
    const keyHash = hashKey(key)

    const apiKey = await db.select().from(apiKeys).where(and(eq(apiKeys.keyHash, keyHash), eq(apiKeys.revoked, false))).limit(1).then((r: any) => r[0])

    if (!apiKey) {
      return { valid: false }
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return { valid: false }
    }

    if (requiredPermission) {
      const hasPermission =
        apiKey.permissions.includes('admin') ||
        apiKey.permissions.includes(requiredPermission)
      if (!hasPermission) {
        return { valid: false }
      }
    }

    await db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, apiKey.id))

    return {
      valid: true,
      userId: apiKey.userId,
      permissions: apiKey.permissions,
    }
  } catch (error) {
    console.error('Failed to validate API key:', error)
    return { valid: false }
  }
}
