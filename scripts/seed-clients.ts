import { createClient } from '@libsql/client'
import * as dotenv from 'dotenv'
dotenv.config()

const url = process.env.DATABASE_URL?.trim() || 'file:./.turso/local.db'
const authToken = process.env.DATABASE_AUTH_TOKEN?.trim()
const client = createClient(
  url.startsWith('libsql://') || url.startsWith('http') ? { url, authToken } : { url }
)

// Real MCP clients - IDEs, apps, tools that connect to MCP servers
const mcpClients = [
  {
    name: 'Claude Desktop',
    description: 'Anthropic desktop app with native MCP server support. Connect to local and remote MCP servers for extended AI capabilities.',
    url: 'https://claude.ai/download',
    icon: '🤖',
    featured: true,
  },
  {
    name: 'Cursor',
    description: 'AI-first code editor with built-in MCP support. Configure MCP servers for enhanced code generation, analysis and debugging.',
    url: 'https://cursor.sh',
    icon: '🖱️',
    featured: true,
  },
  {
    name: 'VS Code Copilot',
    description: 'Visual Studio Code with GitHub Copilot and MCP integration via the Copilot MCP extension. Connect MCP servers for AI-powered development.',
    url: 'https://code.visualstudio.com',
    icon: '💻',
    featured: true,
  },
  {
    name: 'Windsurf',
    description: 'Codeium AI IDE with MCP server support. Flow-based AI coding with deep codebase understanding and MCP extensibility.',
    url: 'https://codeium.com/windsurf',
    icon: '🏄',
    featured: true,
  },
  {
    name: 'Cline',
    description: 'Autonomous AI coding agent for VS Code with MCP support. Create and use MCP tools for file editing, browser automation, and terminal access.',
    url: 'https://cline.bot',
    icon: '⚡',
    featured: true,
  },
  {
    name: 'Continue',
    description: 'Open-source AI code assistant for VS Code and JetBrains with MCP support. Connect any MCP server as a tool provider.',
    url: 'https://continue.dev',
    icon: '▶️',
    featured: true,
  },
  {
    name: 'Zed',
    description: 'High-performance code editor with built-in MCP support. Connect MCP servers for AI-assisted editing and collaboration.',
    url: 'https://zed.dev',
    icon: '⚡',
    featured: true,
  },
  {
    name: 'Roo Code',
    description: 'AI-powered autonomous coding agent for VS Code. Supports MCP servers for extensible tool integration and task automation.',
    url: 'https://roocode.com',
    icon: '🦘',
    featured: false,
  },
  {
    name: 'MCP Inspector',
    description: 'Official Model Context Protocol debugging and inspection tool. Test, debug and validate MCP server implementations interactively.',
    url: 'https://github.com/modelcontextprotocol/inspector',
    icon: '🔍',
    featured: true,
  },
  {
    name: 'AgentGPT',
    description: 'Autonomous AI agent platform with MCP integration. Build and deploy AI agents that leverage MCP servers for tool access.',
    url: 'https://github.com/reworkd/AgentGPT',
    icon: '🤖',
    featured: false,
  },
  {
    name: 'Open Interpreter',
    description: 'Open-source AI code interpreter with MCP support. Run natural language commands locally using MCP server tools.',
    url: 'https://openinterpreter.com',
    icon: '🖥️',
    featured: false,
  },
  {
    name: 'Claude Code',
    description: 'Anthropic CLI tool for AI-powered software development with MCP support. Use MCP servers for extended development capabilities.',
    url: 'https://docs.anthropic.com/en/docs/claude-code',
    icon: '⌨️',
    featured: true,
  },
  {
    name: 'Aider',
    description: 'AI pair programming tool in the terminal with MCP support. Connect MCP servers for enhanced code generation and editing.',
    url: 'https://aider.chat',
    icon: '🤝',
    featured: false,
  },
  {
    name: 'PearAI',
    description: 'AI code editor forked from VS Code with MCP support. Built-in AI chat and code generation with MCP extensibility.',
    url: 'https://pearai.com',
    icon: '🍐',
    featured: false,
  },
  {
    name: 'AIChat',
    description: 'All-in-one AI chat CLI with MCP support. Connect to multiple LLM providers and MCP servers for rich tool use.',
    url: 'https://github.com/sigoden/aichat',
    icon: '💬',
    featured: false,
  },
  {
    name: 'bolt.new',
    description: 'AI-powered full-stack web development platform with MCP integration. Build and deploy apps using MCP server tools.',
    url: 'https://bolt.new',
    icon: '⚡',
    featured: false,
  },
  {
    name: 'Replit Agent',
    description: 'AI coding agent on Replit platform with MCP support. Build, deploy and manage applications using MCP tools.',
    url: 'https://replit.com',
    icon: '🔄',
    featured: false,
  },
  {
    name: 'Devin',
    description: 'Autonomous AI software engineer by Cognition with MCP integration. Full-stack development with MCP tool access.',
    url: 'https://www.cognition.ai/devin',
    icon: '🧠',
    featured: false,
  },
  {
    name: 'Amazon Q Developer',
    description: 'AWS AI coding assistant with MCP support. Build cloud applications using MCP servers for AWS service integration.',
    url: 'https://aws.amazon.com/q/developer/',
    icon: '☁️',
    featured: false,
  },
  {
    name: 'JetBrains AI',
    description: 'AI assistant for JetBrains IDEs with MCP support. Connect MCP servers for enhanced code completion and analysis.',
    url: 'https://www.jetbrains.com/ai/',
    icon: '🛠️',
    featured: false,
  },
  {
    name: 'MCP CLI',
    description: 'Command-line interface for interacting with MCP servers. Test, query and manage MCP server connections from the terminal.',
    url: 'https://github.com/modelcontextprotocol/mcp-cli',
    icon: '⌨️',
    featured: false,
  },
  {
    name: 'Smithery CLI',
    description: 'CLI tool for discovering and installing MCP servers. Browse the Smithery registry and configure servers for any MCP client.',
    url: 'https://smithery.ai',
    icon: '🏭',
    featured: false,
  },
  {
    name: 'mcpm',
    description: 'MCP package manager CLI. Install, configure and manage MCP servers across different clients and projects.',
    url: 'https://github.com/mcpm-io/mcpm',
    icon: '📦',
    featured: false,
  },
  {
    name: 'Superinterface',
    description: 'Embeddable AI chat widget with MCP support. Add MCP-powered AI assistants to any website or application.',
    url: 'https://superinterface.ai',
    icon: '🌐',
    featured: false,
  },
  {
    name: 'Copilot Studio',
    description: 'Microsoft Copilot Studio with MCP integration. Build custom AI copilots that leverage MCP servers for actions and data.',
    url: 'https://copilot.microsoft.com/',
    icon: '🎯',
    featured: false,
  },
  {
    name: 'LlamaIndex',
    description: 'Data framework for LLM applications with MCP support. Build RAG pipelines using MCP servers as data and tool sources.',
    url: 'https://llamaindex.ai',
    icon: '🦙',
    featured: false,
  },
  {
    name: 'CrewAI',
    description: 'Multi-agent AI framework with MCP tool integration. Orchestrate AI agent crews that use MCP servers for real-world actions.',
    url: 'https://crewai.com',
    icon: '👥',
    featured: false,
  },
  {
    name: 'AutoGPT',
    description: 'Autonomous AI agent platform with MCP support. Build and deploy AI agents that use MCP servers for tool access.',
    url: 'https://agpt.co',
    icon: '🤖',
    featured: false,
  },
  {
    name: 'Dify',
    description: 'Open-source LLM app development platform with MCP integration. Build AI workflows that connect to MCP servers for tool use.',
    url: 'https://dify.ai',
    icon: '🔧',
    featured: false,
  },
  {
    name: 'LangGraph Studio',
    description: 'LangChain visual agent builder with MCP support. Design and deploy AI agents with MCP server tool integrations.',
    url: 'https://github.com/langchain-ai/langgraph-studio',
    icon: '📊',
    featured: false,
  },
  {
    name: 'Glama',
    description: 'AI chat platform with MCP server support. Connect to multiple MCP servers for enhanced AI capabilities and tool use.',
    url: 'https://glama.ai',
    icon: '✨',
    featured: false,
  },
  {
    name: 'LibreChat',
    description: 'Open-source AI chat platform with MCP support. Multi-model chat interface with MCP server tool integration.',
    url: 'https://librechat.ai',
    icon: '💬',
    featured: false,
  },
  {
    name: 'Botpress',
    description: 'Conversational AI platform with MCP integration. Build chatbots that leverage MCP servers for tools and data access.',
    url: 'https://botpress.com',
    icon: '🤖',
    featured: false,
  },
  {
    name: 'OpenAI Agents SDK',
    description: 'Python SDK for building AI agents with MCP tool support. Create agents that connect to MCP servers for real-world actions.',
    url: 'https://github.com/openai/openai-agents-python',
    icon: '🔑',
    featured: false,
  },
  {
    name: 'Hermes Agent',
    description: 'Autonomous CLI AI agent with native MCP support. Built-in MCP client for connecting to servers, tools and data sources.',
    url: 'https://hermes-agent.nousresearch.com',
    icon: '🔮',
    featured: false,
  },
  {
    name: 'Vercel AI SDK',
    description: 'TypeScript SDK for building AI apps with MCP support. Integrate MCP servers as tool providers in Next.js and React apps.',
    url: 'https://sdk.vercel.ai',
    icon: '▲',
    featured: false,
  },
  {
    name: 'Google ADK',
    description: 'Google Agent Development Kit with MCP integration. Build AI agents that leverage MCP servers for tools and data.',
    url: 'https://github.com/google/adk-python',
    icon: '🔍',
    featured: false,
  },
  {
    name: 'Semantic Kernel',
    description: 'Microsoft Semantic Kernel with MCP support. Build enterprise AI applications with MCP server tool integrations.',
    url: 'https://github.com/microsoft/semantic-kernel',
    icon: '🧠',
    featured: false,
  },
  {
    name: 'Fireflies.ai',
    description: 'AI meeting assistant with MCP integration. Transcribe, summarize and analyze meetings using MCP-powered tools.',
    url: 'https://fireflies.ai',
    icon: '🔥',
    featured: false,
  },
]

async function seed() {
  console.log(`Seeding ${mcpClients.length} MCP clients...`)

  let created = 0
  for (const c of mcpClients) {
    try {
      await client.execute({
        sql: `INSERT INTO Client (id, name, description, url, icon, featured, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, strftime('%s','now') * 1000, strftime('%s','now') * 1000)`,
        args: [crypto.randomUUID(), c.name, c.description, c.url, c.icon, c.featured ? 1 : 0],
      })
      created++
    } catch (err: any) {
      console.error(`Error inserting ${c.name}: ${err.message}`)
    }
  }

  console.log(`Done: ${created} clients created`)
}

seed().catch(console.error)
