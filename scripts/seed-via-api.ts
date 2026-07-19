import { readFileSync } from 'fs'
import * as path from 'path'

function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env')
    const content = readFileSync(envPath, 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      if (process.env[key] === undefined) {
        process.env[key] = value
      }
    }
  } catch { /* non-critical */ }
}
loadEnv()

const BASE_URL = process.env.SITE_URL || process.env.NEXTAUTH_URL || process.env.SEED_BASE_URL || 'http://localhost:3000'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com'
const envPwd: string | undefined = process.env.ADMIN_SEED_PASSWORD
function getCredential(): string { return envPwd || "" }

interface SeedServer {
  owner: string
  repo: string
  description: string
  category: string
  stars: number
  tags: string[]
  isOfficial: boolean
  isRemote: boolean
  authType?: string
  endpoint?: string
  featured: boolean
  githubUrl: string
  fullSlug: string
}

function extractCookies(setCookieHeaders: string[]): Record<string, string> {
  const cookies: Record<string, string> = {}
  for (const header of setCookieHeaders) {
    const parts = header.split(';')[0]
    const eqIdx = parts.indexOf('=')
    if (eqIdx > 0) {
      const key = parts.slice(0, eqIdx).trim()
      const value = parts.slice(eqIdx + 1).trim()
      cookies[key] = value
    }
  }
  return cookies
}

function cookiesToString(cookies: Record<string, string>): string {
  return Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ')
}

async function authenticate(): Promise<string> {
  if (!getCredential()) {
    process.stdout.write('ERROR: Set ADMIN_SEED_PASSWORD env var before running\n')
    process.exit(1)
  }

  const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`)
  const csrfCookies = extractCookies(csrfRes.headers.getSetCookie?.() || [])
  const csrfData = await csrfRes.json() as { csrfToken: string }
  const csrfToken = csrfData.csrfToken
  process.stdout.write(`CSRF token: ${csrfToken.slice(0, 8)}...\n`)

  const allCookies: Record<string, string> = { ...csrfCookies }

  process.stdout.write('Logging in...\n')
  const loginRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': cookiesToString(allCookies),
    },
    body: `csrfToken=${encodeURIComponent(csrfToken)}&email=${encodeURIComponent(ADMIN_EMAIL)}&password=${encodeURIComponent(getCredential())}`,
    redirect: 'manual',
  })

  const loginCookies = extractCookies(loginRes.headers.getSetCookie?.() || [])
  Object.assign(allCookies, loginCookies)

  const sessionKey = Object.keys(allCookies).find(k => k.includes('session-token'))
  if (!sessionKey) {
    process.stdout.write('ERROR: No session cookie found\n')
    process.stdout.write(`Login status: ${loginRes.status}\n`)
    process.stdout.write(`Login location: ${loginRes.headers.get('location') || 'none'}\n`)
    process.stdout.write(`Cookies received: ${Object.keys(loginCookies).join(', ') || 'none'}\n`)
    process.stdout.write(`All cookies: ${Object.keys(allCookies).join(', ')}\n`)
    process.exit(1)
  }

  process.stdout.write('Logged in successfully\n')
  return cookiesToString(allCookies)
}

async function seedServers(cookieStr: string) {
  const seedPath = path.resolve(process.cwd(), 'scripts', 'mcp-servers-seed.json')
  const data = readFileSync(seedPath, 'utf-8')
  const servers: SeedServer[] = JSON.parse(data)
  process.stdout.write(`Loaded ${servers.length} servers to seed\n`)

  let created = 0
  let failed = 0

  for (let i = 0; i < servers.length; i++) {
    const s = servers[i]
    try {
      const res = await fetch(`${BASE_URL}/api/admin/servers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookieStr,
        },
        body: JSON.stringify({
          name: s.repo,
          description: s.description,
          owner: s.owner,
          repo: s.repo,
          category: s.category,
          githubUrl: s.githubUrl,
          tags: s.tags,
          isOfficial: s.isOfficial,
          isRemote: s.isRemote,
          authType: s.authType,
          endpoint: s.endpoint,
          featured: s.featured,
          stars: s.stars,
          forks: 0,
        }),
      })

      if (res.ok) {
        created++
        process.stdout.write(`[${i + 1}/${servers.length}] + ${s.fullSlug} (${s.category}, ${s.stars}*)\n`)
      } else {
        const text = await res.text()
        failed++
        process.stdout.write(`[${i + 1}/${servers.length}] x ${s.fullSlug}: ${res.status} ${text.slice(0, 80)}\n`)
      }
    } catch (err) {
      failed++
      process.stdout.write(`[${i + 1}/${servers.length}] x ${s.fullSlug}: ${(err as Error).message.slice(0, 80)}\n`)
    }
  }

  process.stdout.write(`\n=== Seed Complete ===\n`)
  process.stdout.write(`Created: ${created}\n`)
  process.stdout.write(`Failed: ${failed}\n`)
}

async function main() {
  const cookieStr = await authenticate()
  await seedServers(cookieStr)
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
