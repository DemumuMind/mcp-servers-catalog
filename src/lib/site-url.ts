/**
 * Centralized site URL configuration.
 * Use this instead of repeating `process.env.SITE_URL || 'https://mcpservers.org'` everywhere.
 *
 * - Server-side code: import { getSiteUrl } from '@/lib/site-url'
 * - Client-side code: use process.env.NEXT_PUBLIC_SITE_URL (Next.js requires NEXT_PUBLIC_ prefix)
 */

const DEFAULT_SITE_URL = 'https://mcpservers.org'

export function getSiteUrl(): string {
  return process.env.SITE_URL || DEFAULT_SITE_URL
}
