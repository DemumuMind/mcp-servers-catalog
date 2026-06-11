'use server'

import { getServers } from './servers'
import { getClients } from './clients'
import { getSubmissions } from './submissions'

function escapeCSV(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function generateCSV(headers: string[], rows: (string | number | boolean | null | undefined)[][]): string {
  const headerRow = headers.map(escapeCSV).join(',')
  const dataRows = rows.map((row) => row.map(escapeCSV).join(','))
  return [headerRow, ...dataRows].join('\n')
}

export async function exportServersToCSV(): Promise<string> {
  const servers = await getServers()
  const headers = ['ID', 'Name', 'Description', 'Owner', 'Repo', 'FullSlug', 'Category', 'Official', 'Sponsored', 'Remote', 'Featured', 'GitHubURL', 'Tags', 'AuthType', 'Endpoint', 'CreatedAt', 'UpdatedAt']
  const rows = servers.map((s: any) => [
    s.id,
    s.name,
    s.description,
    s.owner,
    s.repo,
    s.fullSlug,
    s.category,
    s.isOfficial,
    s.isSponsored,
    s.isRemote,
    s.featured,
    s.githubUrl,
    s.tags.join('; '),
    s.authType || '',
    s.endpoint || '',
    s.createdAt.toISOString(),
    s.updatedAt.toISOString(),
  ])
  return generateCSV(headers, rows)
}

export async function exportClientsToCSV(): Promise<string> {
  const clients = await getClients()
  const headers = ['ID', 'Name', 'Description', 'URL', 'Icon', 'Featured', 'CreatedAt', 'UpdatedAt']
  const rows = clients.map((c: any) => [
    c.id,
    c.name,
    c.description,
    c.url,
    c.icon || '',
    c.featured,
    c.createdAt.toISOString(),
    c.updatedAt.toISOString(),
  ])
  return generateCSV(headers, rows)
}

export async function exportSubmissionsToCSV(): Promise<string> {
  const submissions = await getSubmissions()
  const headers = ['ID', 'Name', 'Description', 'URL', 'Category', 'Email', 'Premium', 'Status', 'CreatedAt', 'UpdatedAt']
  const rows = submissions.map((s: any) => [
    s.id,
    s.name,
    s.description,
    s.url,
    s.category,
    s.email,
    s.premium,
    s.status,
    s.createdAt.toISOString(),
    s.updatedAt.toISOString(),
  ])
  return generateCSV(headers, rows)
}

export async function exportAllToCSV(): Promise<{
  servers: string
  clients: string
  submissions: string
}> {
  const [servers, clients, submissions] = await Promise.all([
    exportServersToCSV(),
    exportClientsToCSV(),
    exportSubmissionsToCSV(),
  ])
  return { servers, clients, submissions }
}
