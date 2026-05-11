// README content analysis helpers

const CLIENT_KEYWORDS = [
  { name: 'Claude Desktop', keywords: ['claude', 'claude desktop', 'anthropic'] },
  { name: 'Cursor', keywords: ['cursor'] },
  { name: 'Continue', keywords: ['continue.dev', 'continue'] },
  { name: 'Cline', keywords: ['cline'] },
  { name: 'Windsurf', keywords: ['windsurf', 'codeium'] },
  { name: 'Zed', keywords: ['zed editor', 'zed'] },
  { name: 'VS Code', keywords: ['vscode', 'vs code', 'visual studio code'] },
]

const INSTALL_SECTIONS = [
  '## install',
  '## installation',
  '## getting started',
  '## setup',
  '## quick start',
  '## usage',
  '## начало работы',
  '## установка',
]

export interface ReadmeAnalysis {
  supportedClients: string[]
  installationSteps: string[]
  suggestedTags: string[]
  hasExamples: boolean
  hasConfigurationSection: boolean
}

export function analyzeReadme(readme: string): ReadmeAnalysis {
  const lower = readme.toLowerCase()

  // Extract supported clients
  const supportedClients: string[] = []
  for (const client of CLIENT_KEYWORDS) {
    if (client.keywords.some((kw) => lower.includes(kw))) {
      supportedClients.push(client.name)
    }
  }

  // Extract installation steps
  const lines = readme.split('\n')
  const installationSteps: string[] = []
  let inInstallSection = false
  let currentStep = ''

  for (const line of lines) {
    const lowerLine = line.toLowerCase().trim()
    if (lowerLine.startsWith('## ')) {
      inInstallSection = INSTALL_SECTIONS.some((s) => lowerLine.includes(s.replace('## ', '')))
      if (!inInstallSection && currentStep) {
        installationSteps.push(currentStep.trim())
        currentStep = ''
      }
      continue
    }
    if (inInstallSection) {
      // Capture code blocks and bullet points as steps
      if (line.trim().startsWith('```') || line.trim().startsWith('- ') || line.trim().startsWith('* ') || line.trim().startsWith('1.')) {
        if (currentStep) {
          installationSteps.push(currentStep.trim())
        }
        currentStep = line.trim()
      } else if (line.trim() && currentStep) {
        currentStep += '\n' + line.trim()
      }
    }
  }
  if (currentStep) installationSteps.push(currentStep.trim())

  // Limit steps
  const limitedSteps = installationSteps.slice(0, 5)

  // Suggest tags based on README content
  const suggestedTags: string[] = []
  const tagKeywords: Record<string, string[]> = {
    database: ['database', 'sql', 'sqlite', 'postgres', 'mysql', 'mongodb'],
    filesystem: ['filesystem', 'file system', 'files', 'fs'],
    web: ['http', 'rest', 'api', 'fetch', 'web'],
    ai: ['openai', 'anthropic', 'llm', 'gpt', 'claude', 'ai'],
    git: ['git', 'github', 'version control'],
    search: ['search', 'index', 'query', 'retrieval'],
    browser: ['browser', 'puppeteer', 'playwright', 'selenium'],
    memory: ['memory', 'cache', 'store', 'persist'],
    calendar: ['calendar', 'schedule', 'event'],
    email: ['email', 'mail', 'smtp'],
    notes: ['note', 'notes', 'obsidian', 'notion'],
    docs: ['documentation', 'docs', 'readme'],
    testing: ['test', 'testing', 'jest', 'vitest'],
  }

  for (const [tag, keywords] of Object.entries(tagKeywords)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      suggestedTags.push(tag)
    }
  }

  // Check for examples
  const hasExamples =
    lower.includes('## example') ||
    lower.includes('## usage') ||
    lower.includes('## пример') ||
    lower.includes('```typescript') ||
    lower.includes('```ts')

  // Check for configuration section
  const hasConfigurationSection =
    lower.includes('## configuration') ||
    lower.includes('## config') ||
    lower.includes('## настройка') ||
    lower.includes('.env')

  return {
    supportedClients,
    installationSteps: limitedSteps,
    suggestedTags: Array.from(new Set(suggestedTags)),
    hasExamples,
    hasConfigurationSection,
  }
}

export function mergeTags(existingTags: string[], githubTopics: string[], readmeTags: string[]): string[] {
  const all = [...existingTags, ...githubTopics, ...readmeTags].map((t) => t.toLowerCase().trim())
  return Array.from(new Set(all)).slice(0, 10)
}
