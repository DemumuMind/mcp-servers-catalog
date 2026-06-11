'use server'


export async function fetchServerReadme(owner: string, repo: string): Promise<string | null> {
  try {
    const branches = ['main', 'master', 'trunk']
    
    for (const branch of branches) {
      const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`
      
      const response = await fetch(url, {
        headers: { 'User-Agent': 'mcpservers-org/1.0' },
        next: { revalidate: 3600 },
      })
      
      if (response.ok) {
        return response.text()
      }
    }
    
    return null
  } catch (error) {
    console.error('Failed to fetch README:', error)
    return null
  }
}
