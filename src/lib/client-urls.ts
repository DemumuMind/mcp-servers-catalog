// External client download URLs — stable public links, not deployment-specific
export const CLIENT_URLS = {
  claudeDesktop: 'https://claude.ai/download',
  cursor: 'https://cursor.com',
  windsurf: 'https://codeium.com/windsurf',
  cline: 'https://cline.bot',
  continue: 'https://continue.dev',
  zed: 'https://zed.dev',
} as const

export const CLIENT_FAVICON_BASES: Record<string, string> = {
  'Cline': 'https://cline.bot/favicon.ico',
  'Continue': 'https://continue.dev/favicon.ico',
  'Zed': 'https://zed.dev/favicon.ico',
  'PearAI': 'https://pearai.com/favicon.ico',
  'Roo Code': 'https://roocode.com/favicon.ico',
} as const
