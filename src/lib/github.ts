const GITHUB_API_BASE = process.env.GITHUB_API_URL || 'https://api.github.com'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ''

interface GitHubRepoData {
  name: string
  description: string | null
  stars: number
  forks: number
  topics: string[]
  license: string | null
  language: string | null
  homepage: string | null
  isArchived: boolean
  updatedAt: string
  htmlUrl: string
  owner: string
  repo: string
}

export interface RateLimitInfo {
  remaining: number
  limit: number
  resetAt: Date
}

/** In-memory rate limit state, updated from every API response header. */
let cachedRateLimit: RateLimitInfo = {
  remaining: 5000,
  limit: 5000,
  resetAt: new Date(0),
}

/**
 * Update the cached rate limit info from a GitHub API response's headers.
 * Called automatically by `githubFetch` after every request.
 */
function updateRateLimitFromHeaders(headers: Headers): void {
  const remaining = headers.get('x-ratelimit-remaining')
  const limit = headers.get('x-ratelimit-limit')
  const reset = headers.get('x-ratelimit-reset')

  if (remaining !== null) {
    cachedRateLimit.remaining = parseInt(remaining, 10)
    lastRateLimitUpdate = Date.now()
  }
  if (limit !== null) {
    cachedRateLimit.limit = parseInt(limit, 10)
  }
  if (reset !== null) {
    const resetEpoch = parseInt(reset, 10)
    if (!isNaN(resetEpoch)) {
      cachedRateLimit.resetAt = new Date(resetEpoch * 1000)
    }
  }
}

/**
 * Get the current GitHub API rate limit info.
 *
 * If the cached info is stale (no recent API calls), this falls back to
 * calling `GET /rate_limit` to get a fresh snapshot.
 */
/** Timestamp of the last time cachedRateLimit was updated from a response header. */
let lastRateLimitUpdate = 0

export async function getRateLimitInfo(): Promise<RateLimitInfo> {
  if (Date.now() - lastRateLimitUpdate < 60_000) {
    return { ...cachedRateLimit }
  }

  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
    }
    if (GITHUB_TOKEN) {
      headers.Authorization = `token ${GITHUB_TOKEN}`
    }

    const res = await fetch(`${GITHUB_API_BASE}/rate_limit`, { headers })
    if (res.ok) {
      const data = await res.json()
      const core = data?.rate || data?.resources?.core
      if (core) {
        cachedRateLimit = {
          remaining: core.remaining ?? cachedRateLimit.remaining,
          limit: core.limit ?? cachedRateLimit.limit,
          resetAt: new Date((core.reset ?? 0) * 1000),
        }
        lastRateLimitUpdate = Date.now()
      }
    }
  } catch {
  }

  return { ...cachedRateLimit }
}

/**
 * If remaining rate limit is below the threshold, sleep until the reset time.
 * Returns the updated rate limit info after waiting (or immediately if no wait).
 */
export async function waitForRateLimit(threshold: number = 100): Promise<RateLimitInfo> {
  const info = await getRateLimitInfo()

  if (info.remaining < threshold) {
    const waitMs = info.resetAt.getTime() - Date.now() + 1000 // +1s buffer
    if (waitMs > 0) {
      console.warn(
        `[rate-limit] Remaining ${info.remaining} < threshold ${threshold}. ` +
        `Sleeping ${Math.round(waitMs / 1000)}s until reset at ${info.resetAt.toISOString()}`
      )
      await new Promise((resolve) => setTimeout(resolve, waitMs))
    }
    return getRateLimitInfo()
  }

  return info
}

async function githubFetch(url: string): Promise<any> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  }
  if (GITHUB_TOKEN) {
    headers.Authorization = `token ${GITHUB_TOKEN}`
  }

  const res = await fetch(url, { headers })

  updateRateLimitFromHeaders(res.headers)

  if (!res.ok) {
    if (res.status === 404) throw new Error('Repository not found')
    if (res.status === 403) throw new Error('GitHub API rate limit exceeded')
    throw new Error(`GitHub API error: ${res.status}`)
  }
  return res.json()
}

export async function fetchGitHubRepo(repoUrl: string): Promise<GitHubRepoData> {
  const url = new URL(repoUrl)
  const pathParts = url.pathname.split('/').filter(Boolean)
  if (pathParts.length < 2) {
    throw new Error('Invalid GitHub repository URL')
  }

  const owner = pathParts[0]
  const repo = pathParts[1]

  const data = await githubFetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`)

  return {
    name: data.name,
    description: data.description,
    stars: data.stargazers_count || 0,
    forks: data.forks_count || 0,
    topics: data.topics || [],
    license: data.license?.spdx_id || null,
    language: data.language || null,
    homepage: data.homepage || null,
    isArchived: data.archived || false,
    updatedAt: data.updated_at,
    htmlUrl: data.html_url,
    owner,
    repo,
  }
}

export async function fetchRepoReadme(repoUrl: string): Promise<string | null> {
  try {
    const url = new URL(repoUrl)
    const pathParts = url.pathname.split('/').filter(Boolean)
    const owner = pathParts[0]
    const repo = pathParts[1]

    const data = await githubFetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/readme`
    )
    return data.content ? Buffer.from(data.content, 'base64').toString('utf-8') : null
  } catch {
    return null
  }
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const parsed = new URL(url)
    const pathParts = parsed.pathname.split('/').filter(Boolean)
    if (pathParts.length >= 2) {
      return { owner: pathParts[0], repo: pathParts[1] }
    }
  } catch {
    return null
  }
  return null
}
