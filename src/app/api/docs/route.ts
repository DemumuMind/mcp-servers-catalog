import { NextResponse } from 'next/server'

// OpenAPI spec served lazily — generated on first request only
let cachedSpec: object | null = null

function buildSpec() {
  return {
    openapi: '3.0.3',
    info: {
      title: 'MCP Servers Catalog API',
      version: '2.0.0',
      description: 'REST API for the MCP Servers Catalog — browse, search, and export MCP server data.',
    },
    servers: [{ url: process.env.SITE_URL || 'https://mcpservers.org' }],
    tags: [
      { name: 'Servers', description: 'Browse and search MCP servers' },
      { name: 'Stats', description: 'Catalog statistics' },
      { name: 'Export', description: 'Data export' },
      { name: 'Feeds', description: 'RSS and JSON feeds' },
      { name: 'Cron', description: 'Scheduled jobs (requires auth)' },
    ],
    paths: {
      '/api/v1/servers': {
        get: {
          tags: ['Servers'],
          summary: 'List servers',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
            { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Search query' },
            { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Filter by category' },
            { name: 'official', in: 'query', schema: { type: 'boolean' } },
            { name: 'remote', in: 'query', schema: { type: 'boolean' } },
            { name: 'sort', in: 'query', schema: { type: 'string', enum: ['stars', 'createdAt', 'name', 'forks'] } },
            { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
          ],
          responses: { '200': { description: 'Server list with pagination' } },
        },
      },
      '/api/v1/servers/{owner}/{repo}': {
        get: {
          tags: ['Servers'],
          summary: 'Get server details',
          parameters: [
            { name: 'owner', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'repo', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: { '200': { description: 'Server details' }, '404': { description: 'Not found' } },
        },
      },
      '/api/v1/stats': {
        get: { tags: ['Stats'], summary: 'Catalog statistics', responses: { '200': { description: 'Stats object' } } },
      },
      '/api/v1/export': {
        get: {
          tags: ['Export'],
          summary: 'Export data',
          parameters: [{ name: 'table', in: 'query', schema: { type: 'string', enum: ['servers', 'clients'] } }],
          responses: { '200': { description: 'Exported data' } },
        },
      },
      '/api/feed/json': {
        get: { tags: ['Feeds'], summary: 'JSON feed', responses: { '200': { description: 'JSON feed' } } },
      },
      '/api/feed/rss': {
        get: { tags: ['Feeds'], summary: 'RSS feed', responses: { '200': { description: 'RSS XML' } } },
      },
    },
  }
}

export async function GET() {
  if (!cachedSpec) cachedSpec = buildSpec()
  return NextResponse.json(cachedSpec, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
