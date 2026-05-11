'use server'

import { fetchGitHubRepo, parseGitHubUrl } from '@/lib/github'
import { rateLimit } from '@/lib/rate-limit'

export async function fetchRepoFromGitHub(url: string) {
  // Rate limit: 30 requests per hour per IP (approximate)
  const rateLimitResult = await rateLimit(`github-api:${url}`, 30, 60 * 60 * 1000)
  if (!rateLimitResult.success) {
    throw new Error('GitHub API rate limit exceeded. Try again later.')
  }

  const parsed = parseGitHubUrl(url)
  if (!parsed) {
    throw new Error('Invalid GitHub URL')
  }

  const data = await fetchGitHubRepo(url)
  return data
}
