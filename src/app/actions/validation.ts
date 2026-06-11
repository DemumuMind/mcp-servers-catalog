'use server'

import { db, servers } from '@/lib/db'

export interface ValidationResult {
  valid: boolean
  checks: {
    name: string
    passed: boolean
    message: string
  }[]
}

type ValidationCheck = ValidationResult['checks'][0]

function checkGitHubUrl(url: string): { match: RegExpMatchArray | null; check: ValidationCheck } {
  const githubRegex = /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/?$/
  const match = url.match(githubRegex)
  return {
    match,
    check: {
      name: 'GitHub URL',
      passed: !!match,
      message: match ? 'Valid GitHub repository URL' : 'URL must be https://github.com/owner/repo',
    },
  }
}

async function checkRepositoryExists(owner: string, repo: string): Promise<{ checks: ValidationCheck[] }> {
  const checks: ValidationCheck[] = []
  let hasPackageJson = false
  let hasMcpKeyword = false

  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
    }
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `token ${process.env.GITHUB_TOKEN}`
    }

    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers })
    const repoExists = repoRes.ok

    if (repoExists) {
      const data = await repoRes.json()
      checks.push({
        name: 'Repository exists',
        passed: true,
        message: `Found: ${data.full_name}`,
      })

      const pkgRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/package.json`, { headers })
      hasPackageJson = pkgRes.ok
      if (hasPackageJson) {
        const pkgData = await pkgRes.json()
        const content = JSON.parse(Buffer.from(pkgData.content, 'base64').toString())
        hasMcpKeyword = !!(content.keywords?.includes('mcp') || content.name?.includes('mcp'))
      }
    } else {
      checks.push({
        name: 'Repository exists',
        passed: false,
        message: 'Repository not found or private',
      })
    }
  } catch {
    checks.push({
      name: 'Repository exists',
      passed: false,
      message: 'Failed to verify repository',
    })
  }

  checks.push({
    name: 'package.json with MCP',
    passed: hasPackageJson && hasMcpKeyword,
    message: hasPackageJson
      ? (hasMcpKeyword ? 'package.json has MCP keyword' : 'package.json found but missing MCP keyword')
      : 'No package.json found',
  })

  return { checks }
}

async function checkReadmeExists(owner: string, repo: string): Promise<ValidationCheck> {
  let hasReadme = false
  try {
    const readmeRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`)
    hasReadme = readmeRes.ok
    if (!hasReadme) {
      const masterRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`)
      hasReadme = masterRes.ok
    }
  } catch {
    hasReadme = false
  }

  return {
    name: 'README',
    passed: hasReadme,
    message: hasReadme ? 'README found' : 'No README.md found',
  }
}

async function checkRemoteEndpoint(endpoint: string): Promise<ValidationCheck> {
  try {
    const endpointRes = await fetch(endpoint, { method: 'HEAD', signal: AbortSignal.timeout(5000) })
    return {
      name: 'Remote endpoint',
      passed: endpointRes.ok,
      message: endpointRes.ok ? 'Endpoint is reachable' : `Endpoint returned ${endpointRes.status}`,
    }
  } catch {
    return {
      name: 'Remote endpoint',
      passed: false,
      message: 'Endpoint is not reachable',
    }
  }
}

export async function validateServer(url: string, isRemote: boolean = false, endpoint?: string): Promise<ValidationResult> {
  const checks: ValidationResult['checks'] = []

  // 1. Check if URL is valid GitHub repo
  const { match: githubMatch, check: urlCheck } = checkGitHubUrl(url)
  checks.push(urlCheck)

  if (!githubMatch) {
    return { valid: false, checks }
  }

  const [owner, repo] = [githubMatch[1], githubMatch[2]]

  // 2 & 3. Check repository exists and package.json
  const repoResult = await checkRepositoryExists(owner, repo)
  checks.push(...repoResult.checks)

  // 4. Check README
  const readmeCheck = await checkReadmeExists(owner, repo)
  checks.push(readmeCheck)

  // 5. Remote endpoint check
  if (isRemote && endpoint) {
    const endpointCheck = await checkRemoteEndpoint(endpoint)
    checks.push(endpointCheck)
  }

  const valid = checks.every((c) => c.passed)
  return { valid, checks }
}

export async function validateAllServers() {
  const serverList = await db.select({
    id: servers.id,
    githubUrl: servers.githubUrl,
    isRemote: servers.isRemote,
    endpoint: servers.endpoint,
  }).from(servers)

  const results: Array<{ id: string; name: string; result: ValidationResult }> = []

  for (const server of serverList.slice(0, 10)) { // Validate first 10 to avoid rate limits
    try {
      const result = await validateServer(server.githubUrl, server.isRemote, server.endpoint || undefined)
      results.push({ id: server.id, name: server.githubUrl, result })
      await new Promise((r) => setTimeout(r, 1000))
    } catch {
      // Skip failed validations
    }
  }

  return results
}
