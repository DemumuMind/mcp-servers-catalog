'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

export async function createWebhook(
  userId: string,
  url: string,
  events: string[]
): Promise<{ success: boolean; webhook?: { id: string; url: string; events: string[] } }> {
  try {
    const secret = 'whsec_' + crypto.randomBytes(32).toString('hex')

    const webhook = await prisma.webhook.create({
      data: {
        userId,
        url,
        secret,
        events,
      },
    })

    revalidatePath('/profile/webhooks')

    return {
      success: true,
      webhook: {
        id: webhook.id,
        url: webhook.url,
        events: webhook.events,
      },
    }
  } catch (error) {
    console.error('Failed to create webhook:', error)
    return { success: false }
  }
}

export async function listWebhooks(userId: string): Promise<Array<{
  id: string
  url: string
  events: string[]
  active: boolean
  lastError: string | null
  createdAt: Date
}>> {
  try {
    const webhooks = await prisma.webhook.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        url: true,
        events: true,
        active: true,
        lastError: true,
        createdAt: true,
      },
    })

    return webhooks
  } catch (error) {
    console.error('Failed to list webhooks:', error)
    return []
  }
}

export async function deleteWebhook(userId: string, webhookId: string): Promise<{ success: boolean }> {
  try {
    await prisma.webhook.deleteMany({
      where: { id: webhookId, userId },
    })

    revalidatePath('/profile/webhooks')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete webhook:', error)
    return { success: false }
  }
}

export async function toggleWebhook(userId: string, webhookId: string): Promise<{ success: boolean }> {
  try {
    const webhook = await prisma.webhook.findFirst({
      where: { id: webhookId, userId },
    })

    if (!webhook) return { success: false }

    await prisma.webhook.update({
      where: { id: webhookId },
      data: { active: !webhook.active },
    })

    revalidatePath('/profile/webhooks')
    return { success: true }
  } catch (error) {
    console.error('Failed to toggle webhook:', error)
    return { success: false }
  }
}

// Trigger webhooks for an event with retries
export async function triggerWebhooks(
  event: string,
  payload: Record<string, unknown>
): Promise<void> {
  try {
    const webhooks = await prisma.webhook.findMany({
      where: {
        active: true,
        events: { has: event },
      },
    })

    await Promise.all(
      webhooks.map(async (webhook) => {
        const maxRetries = 3
        let lastError = ''

        for (let attempt = 0; attempt < maxRetries; attempt++) {
          try {
            // Exponential backoff: 0ms, 1000ms, 4000ms
            if (attempt > 0) {
              await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000))
            }

            const response = await fetch(webhook.url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Webhook-Secret': webhook.secret,
                'X-Webhook-Event': event,
                'X-Webhook-Attempt': String(attempt + 1),
              },
              body: JSON.stringify({
                event,
                timestamp: new Date().toISOString(),
                payload,
              }),
            })

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${await response.text()}`)
            }

            // Success — clear error and stop retrying
            await prisma.webhook.update({
              where: { id: webhook.id },
              data: { lastError: null },
            })
            return
          } catch (error) {
            lastError = error instanceof Error ? error.message : 'Unknown error'
            if (attempt === maxRetries - 1) {
              // All retries exhausted
              await prisma.webhook.update({
                where: { id: webhook.id },
                data: { lastError: `${lastError} (failed after ${maxRetries} attempts)` },
              })
            }
          }
        }
      })
    )
  } catch (error) {
    console.error('Failed to trigger webhooks:', error)
  }
}
