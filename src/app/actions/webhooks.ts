'use server'

import { db, webhooks } from '@/lib/db'
import { eq, and, desc, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

export async function createWebhook(
  userId: string,
  url: string,
  events: string[]
): Promise<{ success: boolean; webhook?: { id: string; url: string; events: string[] } }> {
  try {
    const secret = 'whsec_' + crypto.randomBytes(32).toString('hex')

    const [webhook] = await db
      .insert(webhooks)
      .values({
        userId,
        url,
        secret,
        events,
      })
      .returning()

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
    const result = await db
      .select({
        id: webhooks.id,
        url: webhooks.url,
        events: webhooks.events,
        active: webhooks.active,
        lastError: webhooks.lastError,
        createdAt: webhooks.createdAt,
      })
      .from(webhooks)
      .where(eq(webhooks.userId, userId))
      .orderBy(desc(webhooks.createdAt))

    return result
  } catch (error) {
    console.error('Failed to list webhooks:', error)
    return []
  }
}

export async function deleteWebhook(userId: string, webhookId: string): Promise<{ success: boolean }> {
  try {
    await db
      .delete(webhooks)
      .where(and(eq(webhooks.id, webhookId), eq(webhooks.userId, userId)))

    revalidatePath('/profile/webhooks')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete webhook:', error)
    return { success: false }
  }
}

export async function toggleWebhook(userId: string, webhookId: string): Promise<{ success: boolean }> {
  try {
    const rows = await db
      .select()
      .from(webhooks)
      .where(and(eq(webhooks.id, webhookId), eq(webhooks.userId, userId)))
      .limit(1)

    const webhook = rows[0]
    if (!webhook) return { success: false }

    await db
      .update(webhooks)
      .set({ active: !webhook.active })
      .where(eq(webhooks.id, webhookId))

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
    // Find active webhooks whose events JSON array contains this event
    const activeWebhooks = await db
      .select()
      .from(webhooks)
      .where(
        and(
          eq(webhooks.active, true),
          sql`EXISTS (SELECT 1 FROM json_each(${webhooks.events}) WHERE json_each.value = ${event})`
        )
      )

    await Promise.all(
      activeWebhooks.map(async (webhook: any) => {
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
            await db
              .update(webhooks)
              .set({ lastError: null })
              .where(eq(webhooks.id, webhook.id))
            return
          } catch (error) {
            lastError = error instanceof Error ? error.message : 'Unknown error'
            if (attempt === maxRetries - 1) {
              // All retries exhausted
              await db
                .update(webhooks)
                .set({ lastError: `${lastError} (failed after ${maxRetries} attempts)` })
                .where(eq(webhooks.id, webhook.id))
            }
          }
        }
      })
    )
  } catch (error) {
    console.error('Failed to trigger webhooks:', error)
  }
}
