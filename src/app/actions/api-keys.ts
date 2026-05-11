'use server'

import { prisma } from '@/lib/db'
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

    const apiKey = await prisma.apiKey.create({
      data: {
        userId,
        name,
        keyHash,
        keyPrefix,
        permissions,
      },
    })

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
    const keys = await prisma.apiKey.findMany({
      where: { userId, revoked: false },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        permissions: true,
        lastUsedAt: true,
        createdAt: true,
        revoked: true,
      },
    })

    return keys
  } catch (error) {
    console.error('Failed to list API keys:', error)
    return []
  }
}

export async function revokeApiKey(userId: string, keyId: string): Promise<{ success: boolean }> {
  try {
    await prisma.apiKey.updateMany({
      where: { id: keyId, userId },
      data: { revoked: true },
    })

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

    const apiKey = await prisma.apiKey.findUnique({
      where: { keyHash, revoked: false },
    })

    if (!apiKey) {
      return { valid: false }
    }

    // Check expiration
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return { valid: false }
    }

    // RBAC: check required permission
    if (requiredPermission) {
      const hasPermission =
        apiKey.permissions.includes('admin') ||
        apiKey.permissions.includes(requiredPermission)
      if (!hasPermission) {
        return { valid: false }
      }
    }

    // Update last used
    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    })

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
