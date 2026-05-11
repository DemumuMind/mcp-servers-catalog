import { readFileSync } from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'
import { PGlite } from '@electric-sql/pglite'
import { PrismaPGlite } from 'pglite-prisma-adapter'

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
  } catch {
    // ignore
  }
}
loadEnv()

function getDataDir(): string {
  const dir = process.env.DATABASE_DIR?.trim()
  return dir ? path.resolve(dir) : path.resolve(process.cwd(), '.pglite3')
}

function createPrisma() {
  const dataDir = getDataDir()
  console.log(`Using database directory: ${dataDir}`)
  const pglite = new PGlite({ dataDir })
  const adapter = new PrismaPGlite(pglite)
  return { prisma: new PrismaClient({ adapter }), pglite }
}

const { prisma, pglite } = createPrisma()

const CLIENTS = [
  { name: 'MCP Dock', description: 'A macOS app to centralize and sync MCP configs for Claude Code, Codex, Cursor, and more.', url: 'https://github.com/mcp-dock/mcp-dock', featured: true },
  { name: '5ire', description: 'Open source cross-platform desktop AI assistant that supports tools through MCP servers', url: 'https://github.com/nanbing/5ire' },
  { name: 'AgentAI', description: 'Rust library designed to simplify AI agent creation with MCP server integration', url: 'https://github.com/agent-ai/agentai' },
  { name: 'AgenticFlow', description: 'No-code AI platform for building agents that connect 2,500+ APIs and 10,000+ tools via MCP', url: 'https://github.com/agenticflow/agenticflow' },
  { name: 'Amazon Q CLI', description: 'Open-source agentic coding assistant for terminals with full MCP server support', url: 'https://github.com/aws/amazon-q-developer-cli' },
  { name: 'Apify MCP Tester', description: 'Open-source client connecting to MCP servers using Server-Sent Events.', url: 'https://github.com/apify/mcp-tester' },
  { name: 'Augment Code', description: 'AI-powered coding platform for VS Code and JetBrains with autonomous agents and MCP support', url: 'https://augmentcode.com' },
  { name: 'BeeAI Framework', description: 'Open-source framework for building, deploying, and serving powerful agentic workflows with MCP integration', url: 'https://github.com/beeai/beeai-framework' },
  { name: 'Beyond Better', description: 'Knowledge work collaborator with MCP integration connecting diverse data sources (local, Notion, Google) and curated tools across all LLM providers, including local-only Ollama mode.', url: 'https://github.com/beyondbetter/beyondbetter' },
  { name: 'BoltAI', description: 'Native, all-in-one AI chat client with MCP support for multiple platforms', url: 'https://boltai.com' },
  { name: 'Claude Code', description: 'Interactive agentic coding tool from Anthropic with MCP integration for prompts and tools', url: 'https://claude.ai/code' },
  { name: 'Claude.ai', description: "Anthropic's web-based AI assistant with MCP support for remote servers", url: 'https://claude.ai' },
  { name: 'Claude Desktop App', description: "Anthropic's desktop application with comprehensive MCP support for local and remote servers", url: 'https://claude.ai/download' },
  { name: 'Cline', description: 'Autonomous coding agent in VS Code that edits files, runs commands, and uses MCP servers', url: 'https://github.com/cline/cline' },
  { name: 'Continue', description: 'Open-source AI code assistant with built-in support for all MCP features', url: 'https://github.com/continuedev/continue' },
  { name: 'Copilot-MCP', description: 'AI coding assistance tool that enables integration with MCP servers', url: 'https://github.com/copilot-mcp/copilot-mcp' },
  { name: 'Cursor', description: 'AI code editor with support for MCP tools in Cursor Composer.', url: 'https://cursor.com' },
  { name: 'Daydreams Agents', description: 'Generative agent framework for executing anything onchain with MCP server support', url: 'https://github.com/daydreams/daydreams' },
  { name: 'Emacs MCP', description: 'Emacs client for interfacing with MCP servers and providing tool support', url: 'https://github.com/emacs-mcp/emacs-mcp' },
  { name: 'fast-agent', description: 'Python Agent framework with full multi-modal MCP support and end-to-end tests', url: 'https://github.com/evalstate/fast-agent' },
  { name: 'FLUJO', description: 'Desktop application integrating MCP to provide workflow-builder interface for AI interactions', url: 'https://github.com/flujo/flujo' },
  { name: 'Genkit', description: 'Cross-language SDK for building GenAI features with MCP server integration', url: 'https://github.com/firebase/genkit' },
  { name: 'Glama', description: 'Comprehensive AI workspace with integrated MCP Server Directory and multi-LLM support', url: 'https://glama.ai' },
  { name: 'GenAIScript', description: 'JavaScript toolbox for assembling prompts for LLMs with MCP tool support', url: 'https://github.com/microsoft/genaiscript' },
  { name: 'Goose', description: 'Open source AI agent for software development with MCP functionality through tools', url: 'https://github.com/block/goose' },
  { name: 'gptme', description: 'Open-source terminal-based personal AI assistant with MCP tool support', url: 'https://github.com/gptme/gptme' },
  { name: 'HyperAgent', description: 'Playwright supercharged with AI, extensible with MCP servers for enhanced capabilities', url: 'https://github.com/hyperagent/hyperagent' },
  { name: 'JetBrains AI Assistant', description: 'AI-powered features for software development available in all JetBrains IDEs with MCP support', url: 'https://jetbrains.com/ai' },
  { name: 'Klavis AI', description: 'Open-source infrastructure for using, building and scaling MCPs with Slack/Discord/Web clients', url: 'https://github.com/klavis-ai/klavis' },
  { name: 'LibreChat', description: 'Open-source, customizable AI chat UI with MCP integration for agent tools', url: 'https://github.com/danny-avila/librechat' },
  { name: 'Lutra', description: 'AI agent that transforms conversations into actionable workflows with easy MCP integration', url: 'https://lutra.ai' },
  { name: 'mcp-agent', description: 'Simple, composable framework to build agents using Model Context Protocol', url: 'https://github.com/lastmile-ai/mcp-agent' },
  { name: 'mcp-use', description: 'Open source Python library to easily connect any LLM to any MCP server', url: 'https://github.com/mcp-use/mcp-use' },
  { name: 'MCPHub', description: 'Powerful Neovim plugin that integrates MCP servers into your workflow', url: 'https://github.com/ravitemer/mcphub.nvim' },
  { name: 'MCPOmni-Connect', description: 'Versatile CLI client for connecting to MCP servers with agentic mode and orchestrator capabilities', url: 'https://github.com/mcpomni-connect/mcpomni-connect' },
  { name: 'Memex', description: 'All-in-one desktop app for building and testing MCP servers with prompt-to-server generation', url: 'https://github.com/memex/memex' },
  { name: 'Microsoft Copilot Studio', description: 'SaaS platform for building custom AI-driven applications with MCP tool support', url: 'https://copilotstudio.microsoft.com' },
  { name: 'MindPal', description: 'No-code platform for building AI agents and multi-agent workflows with MCP server support.', url: 'https://mindpal.io' },
  { name: 'MooPoint', description: 'Web-based AI chat platform with tool calling support and OAuth for MCP servers', url: 'https://github.com/moopoint/moopoint' },
  { name: 'Misty Studio', description: 'Privacy-first AI productivity platform integrating local and online LLMs with MCP toolsets', url: 'https://github.com/misty-studio/misty-studio' },
  { name: 'NVIDIA Agent Intelligence (AIO) toolkit', description: 'Flexible library for connecting enterprise agents to data sources and tools with MCP support', url: 'https://github.com/nvidia/aio-toolkit' },
  { name: 'OpenSumi', description: 'Framework for building AI Native IDE products with MCP tool support', url: 'https://github.com/opensumi/opensumi' },
  { name: 'oterm', description: 'Terminal client for Ollama with support for MCP tools and multiple chat sessions', url: 'https://github.com/oterm/oterm' },
  { name: 'Postman', description: 'Popular API client with full MCP server testing and debugging support', url: 'https://postman.com' },
  { name: 'Reply MCP', description: 'Cut campaign admin, make smarter decisions, scale your outreach without hiring. Your AI handles the operations while you close deals', url: 'https://github.com/reply-mcp/reply-mcp' },
  { name: 'Roo Code', description: 'AI coding assistance platform with MCP tools and resources integration', url: 'https://github.com/roocode/roocode' },
  { name: 'Simtheory', description: 'MCP client with model switching, assistants and agentic mode', url: 'https://github.com/simtheory/simtheory' },
  { name: 'Slack MCP Client', description: 'Bridge between Slack and MCP servers enabling LLMs to interact through Slack interface', url: 'https://github.com/slack-mcp/slack-mcp' },
  { name: 'Sourcegraph Cody', description: 'AI coding assistant with MCP resource support through OpenCTX integration', url: 'https://sourcegraph.com/cody' },
  { name: 'SpinAI', description: 'Open-source TypeScript framework for building observable AI agents with native MCP support', url: 'https://github.com/spinai/spinai' },
  { name: 'Superinterface', description: 'AI infrastructure and developer platform for building in-app AI assistants with MCP support', url: 'https://superinterface.ai' },
  { name: 'Superjoin', description: 'Google Sheets extension bringing MCP tools and agents directly into spreadsheets', url: 'https://github.com/superjoin/superjoin' },
  { name: 'TheiaAI/TheiaIDE', description: 'Framework and IDE for AI-enhanced tools with MCP server integration for agents', url: 'https://theia-ide.org' },
  { name: 'Tome', description: 'Open source cross-platform desktop app for working with local LLMs and MCP servers', url: 'https://github.com/tome/tome' },
  { name: 'TypingMind App', description: 'Advanced frontend for LLMs with MCP tool integration and AI agent support', url: 'https://typingmind.com' },
  { name: 'VS Code GitHub Copilot', description: 'VS Code integration with GitHub Copilot featuring comprehensive MCP support', url: 'https://github.com/features/copilot' },
  { name: 'Warp', description: 'Intelligent terminal with AI and MCP support for natural language command line interaction', url: 'https://warp.dev' },
  { name: 'WhatsMCP', description: 'MCP client for WhatsApp enabling AI stack interaction through WhatsApp chat', url: 'https://github.com/whatsmcp/whatsmcp' },
  { name: 'Windsurf Editor', description: 'Agentic IDE with AI Flow system and MCP support for collaborative development', url: 'https://codeium.com/windsurf' },
  { name: 'Witsy', description: 'AI desktop assistant supporting Anthropic models and MCP servers as LLM tools', url: 'https://github.com/witsy-ai/witsy' },
  { name: 'Zed', description: 'High-performance code editor with MCP support focusing on prompt templates and tools', url: 'https://zed.dev' },
  { name: 'Zencoder', description: 'Coding agent for VS Code and JetBrains with integrated MCP tool library', url: 'https://github.com/zencoder/zencoder' },
]

async function main() {
  let created = 0
  let skipped = 0

  for (const client of CLIENTS) {
    const existing = await prisma.client.findFirst({
      where: { name: client.name },
    })

    if (existing) {
      console.log(`Skipping existing: ${client.name}`)
      skipped++
      continue
    }

    await prisma.client.create({
      data: {
        name: client.name,
        description: client.description,
        url: client.url,
        featured: client.featured || false,
      },
    })
    created++
    console.log(`Created: ${client.name}`)
  }

  console.log(`\n--- Done ---`)
  console.log(`Created: ${created}`)
  console.log(`Skipped: ${skipped}`)

  await prisma.$disconnect()
  await pglite.close()
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
