/**
 * JSON-LD structured data generators for SEO
 */

import { getSiteUrl } from '@/lib/site-url'

const SITE_NAME = 'MCP Servers Catalog'
const SITE_URL = getSiteUrl()
const SITE_DESC = 'Discover and compare MCP (Model Context Protocol) servers for AI assistants. Browse 1,500+ servers with ratings, health checks, and installation guides.'

export function generateWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESC,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/en/advanced-search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: ['https://github.com/DemumuMind/mcp-servers-catalog'],
  }
}

export function generateServerJsonLd(server: {
  name: string
  description: string | null
  owner: string
  repo: string
  stars: number
  forks: number
  githubUrl: string
  tags: string[] | null
  [key: string]: unknown
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: server.name,
    description: server.description || `MCP Server: ${server.name}`,
    url: `${SITE_URL}/en/servers/${server.owner}/${server.repo}`,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.5',
      reviewCount: '1',
    },
    author: {
      '@type': 'Organization',
      name: server.owner,
      url: `https://github.com/${server.owner}`,
    },
    programmingLanguage: 'TypeScript',
    installUrl: `npx -y @${server.owner}/${server.repo}`,
    keywords: server.tags?.join(', ') || 'MCP, AI, LLM',
    codeRepository: server.githubUrl,
    discussionUrl: `${server.githubUrl}/issues`,
  }
}

export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function generateItemListJsonLd(items: {
  name: string
  url: string
  position: number
}[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      url: item.url,
    })),
  }
}
