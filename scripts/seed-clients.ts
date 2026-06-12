import { db } from '../src/lib/db'
import { clients } from '../src/lib/db/schema'
import clientUrls from './seed-data/client-urls.json'

async function seedClients() {
  const urlMap = new Map(clientUrls.clients.map(c => [c.name, c.url]))
  
  const clientData = [
    { name: 'Claude Desktop', slug: 'claude-desktop', icon: '🤖', type: 'desktop', description: 'AI assistant by Anthropic', isOfficial: true, category: 'desktop' },
    { name: 'Cursor', slug: 'cursor', icon: '💻', type: 'desktop', description: 'AI-first code editor', isOfficial: false, category: 'desktop' },
    { name: 'VS Code', slug: 'vscode', icon: '📝', type: 'desktop', description: 'Microsoft code editor with MCP support', isOfficial: false, category: 'desktop' },
    { name: 'Windsurf', slug: 'windsurf', icon: '🌊', type: 'desktop', description: 'AI code editor by Codeium', isOfficial: false, category: 'desktop' },
    { name: 'Cline', slug: 'cline', icon: '⚡', type: 'extension', description: 'Autonomous coding agent for VS Code', isOfficial: false, category: 'extension' },
    { name: 'Continue', slug: 'continue', icon: '🔄', type: 'extension', description: 'Open-source AI code assistant', isOfficial: false, category: 'extension' },
    { name: 'Zed', slug: 'zed', icon: '📝', type: 'desktop', description: 'High-performance code editor', isOfficial: false, category: 'desktop' },
    { name: 'Roo Code', slug: 'roocode', icon: '🦘', type: 'extension', description: 'AI coding assistant', isOfficial: false, category: 'extension' },
    { name: 'Open Interpreter', slug: 'open-interpreter', icon: '🖥️', type: 'cli', description: 'Open-source code interpreter', isOfficial: false, category: 'cli' },
    { name: 'Aider', slug: 'aider', icon: '🤝', type: 'cli', description: 'AI pair programming in terminal', isOfficial: false, category: 'cli' },
    { name: 'PearAI', slug: 'pearai', icon: '🍐', type: 'desktop', description: 'Open-source AI code editor', isOfficial: false, category: 'desktop' },
    { name: 'Bolt', slug: 'bolt', icon: '⚡', type: 'web', description: 'AI web development platform', isOfficial: false, category: 'web' },
    { name: 'Replit', slug: 'replit', icon: '🔄', type: 'web', description: 'Online IDE with AI features', isOfficial: false, category: 'web' },
    { name: 'Devin', slug: 'devin', icon: '🤖', type: 'agent', description: 'Autonomous AI software engineer', isOfficial: false, category: 'agent' },
    { name: 'Amazon Q Developer', slug: 'amazon-q', icon: '☁️', type: 'extension', description: 'AWS AI coding companion', isOfficial: false, category: 'extension' },
    { name: 'JetBrains AI', slug: 'jetbrains-ai', icon: '🧠', type: 'extension', description: 'AI assistant for JetBrains IDEs', isOfficial: false, category: 'extension' },
    { name: 'Smithery', slug: 'smithery', icon: '🏭', type: 'platform', description: 'MCP server registry', isOfficial: false, category: 'platform' },
    { name: 'Superinterface', slug: 'superinterface', icon: '✨', type: 'platform', description: 'AI interface platform', isOfficial: false, category: 'platform' },
    { name: 'Microsoft Copilot', slug: 'copilot', icon: '🪟', type: 'extension', description: 'AI assistant by Microsoft', isOfficial: false, category: 'extension' },
    { name: 'LlamaIndex', slug: 'llamaindex', icon: '🦙', type: 'framework', description: 'Data framework for LLM apps', isOfficial: false, category: 'framework' },
    { name: 'CrewAI', slug: 'crewai', icon: '👥', type: 'framework', description: 'Multi-agent AI framework', isOfficial: false, category: 'framework' },
    { name: 'AutoGPT', slug: 'autogpt', icon: '🤖', type: 'agent', description: 'Autonomous AI agent', isOfficial: false, category: 'agent' },
    { name: 'Dify', slug: 'dify', icon: '🎯', type: 'platform', description: 'LLM application development platform', isOfficial: false, category: 'platform' },
    { name: 'Glama', slug: 'glama', icon: '🎭', type: 'platform', description: 'MCP server directory', isOfficial: false, category: 'platform' },
    { name: 'LibreChat', slug: 'librechat', icon: '💬', type: 'web', description: 'Open-source AI chat platform', isOfficial: false, category: 'web' },
    { name: 'Botpress', slug: 'botpress', icon: '🤖', type: 'platform', description: 'Conversational AI platform', isOfficial: false, category: 'platform' },
    { name: 'Hermes Agent', slug: 'hermes-agent', icon: '🕊️', type: 'agent', description: 'AI agent by Nous Research', isOfficial: false, category: 'agent' },
    { name: 'Vercel AI SDK', slug: 'vercel-ai-sdk', icon: '▲', type: 'framework', description: 'AI SDK for web developers', isOfficial: false, category: 'framework' },
    { name: 'Fireflies', slug: 'fireflies', icon: '🔥', type: 'web', description: 'AI meeting assistant', isOfficial: false, category: 'web' },
  ].map(c => ({
    ...c,
    url: urlMap.get(c.name) || '',
  }))

  for (const client of clientData) {
    await db.insert(clients).values(client).onConflictDoNothing()
  }

  console.error(`Seeded ${clientData.length} clients`)
}

seedClients().catch(console.error)
