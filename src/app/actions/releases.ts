'use server'

interface GitHubRelease {
  tag_name: string
  name: string
  body: string | null
  published_at: string
  html_url: string
  prerelease: boolean
  draft: boolean
}

export async function fetchServerReleases(owner: string, repo: string): Promise<GitHubRelease[]> {
  try {
    const token = process.env.GITHUB_TOKEN
    const headers: Record<string, string> = {
      'User-Agent': 'mcpservers-org/1.0',
      'Accept': 'application/vnd.github+json',
    }
    
    if (token) {
      headers['Authorization'] = `token ${token}`
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/releases?per_page=5`,
      { headers, next: { revalidate: 3600 } }
    )

    if (!response.ok) {
      if (response.status === 404) {
        // Try tags as fallback
        const tagsResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/tags?per_page=5`,
          { headers, next: { revalidate: 3600 } }
        )
        
        if (tagsResponse.ok) {
          const tags = await tagsResponse.json()
          return tags.map((tag: any) => ({
            tag_name: tag.name,
            name: tag.name,
            body: null,
            published_at: new Date().toISOString(),
            html_url: `https://github.com/${owner}/${repo}/releases/tag/${tag.name}`,
            prerelease: false,
            draft: false,
          }))
        }
      }
      return []
    }

    const releases = await response.json()
    return releases
      .filter((r: GitHubRelease) => !r.draft)
      .slice(0, 5)
  } catch (error) {
    console.error('Failed to fetch releases:', error)
    return []
  }
}
