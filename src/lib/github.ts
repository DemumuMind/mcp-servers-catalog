const GITHUB_API_BASE = 'https://api.github.com'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ''

interface GitHubRepoData {
  name: string
  description: string | null
  stars: number
  forks: number
  topics: string[]
  license: string | null
  language: string | null
  updatedAt: string
  htmlUrl: string
  owner: string
  repo: string
}

async function githubFetch(url: string): Promise<any> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  }
  if (GITHUB_TOKEN) {
    headers.Authorization = `token ${GITHUB_TOKEN}`
  }

  const res = await fetch(url, { headers })
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
    language: data.language,
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
    return data.content ? atob(data.content) : null
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
