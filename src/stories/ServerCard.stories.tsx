import type { Meta, StoryObj } from '@storybook/react'
import { ServerCard } from '../components/server-card'

const mockServer = {
  id: '1',
  name: 'DeepWiki MCP',
  description: 'Remote, no-auth MCP server providing AI-powered codebase context and answers',
  owner: 'devin',
  repo: 'deepwiki-mcp',
  fullSlug: 'devin/deepwiki-mcp',
  category: 'Поиск',
  tags: ['official', 'mcp', 'ai'],
  isOfficial: true,
  isSponsored: false,
  isRemote: true,
  authType: 'none',
  endpoint: 'https://api.deepwiki.com/mcp',
  featured: true,
  stars: 38642,
  forks: 2441,
  githubUrl: 'https://github.com/devin/deepwiki-mcp',
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockServerMinimal = {
  id: '2',
  name: 'Simple MCP',
  description: 'A simple MCP server for testing',
  owner: 'simple',
  repo: 'simple-mcp',
  fullSlug: 'simple/simple-mcp',
  category: 'Другое',
  tags: [],
  isOfficial: false,
  isSponsored: false,
  isRemote: false,
  authType: null,
  endpoint: null,
  featured: false,
  stars: 0,
  forks: 0,
  githubUrl: 'https://github.com/simple/simple-mcp',
  createdAt: new Date(),
  updatedAt: new Date(),
}

const meta: Meta<typeof ServerCard> = {
  title: 'Components/ServerCard',
  component: ServerCard,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof ServerCard>

export const Featured: Story = {
  args: {
    server: mockServer,
    locale: 'ru',
  },
}

export const Minimal: Story = {
  args: {
    server: mockServerMinimal,
    locale: 'ru',
  },
}

export const English: Story = {
  args: {
    server: mockServer,
    locale: 'en',
  },
}
