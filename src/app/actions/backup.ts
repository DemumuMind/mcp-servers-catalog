'use server'

import { createClient, type Client } from '@libsql/client'
import { requireAdmin } from '@/lib/auth-guard'
import { logAudit } from './audit-log'

const DANGEROUS_SQL_PATTERNS = [
  /\bDROP\b/i,
  /\bDELETE\b/i,
  /\bTRUNCATE\b/i,
  /\bALTER\b/i,
  /\bGRANT\b/i,
  /\bREVOKE\b/i,
  /\bATTACH\b/i,
  /\bDETACH\b/i,
]

function validateSqlStatement(statement: string): boolean {
  const trimmed = statement.trim().toUpperCase()
  if (!trimmed.startsWith('INSERT') && !trimmed.startsWith('CREATE TABLE')) {
    return false
  }
  for (const pattern of DANGEROUS_SQL_PATTERNS) {
    if (pattern.test(statement)) return false
  }
  return true
}

function escapeSqlValue(value: unknown): string {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'boolean') return value ? '1' : '0'
  if (typeof value === 'number') return String(value)
  if (value instanceof Date) return `'${value.toISOString()}'`
  if (Array.isArray(value) || typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`
  return `'${String(value).replace(/'/g, "''")}'`
}

function getDbUrl(): string {
  return process.env.DATABASE_URL?.trim() || 'file:./.turso/local.db'
}

function createDbClient(): Client {
  const url = getDbUrl()
  const authToken = process.env.DATABASE_AUTH_TOKEN?.trim()
  if (url.startsWith('libsql://') || url.startsWith('http://') || url.startsWith('https://')) {
    return createClient({ url, authToken })
  }
  return createClient({ url })
}

export async function backupDatabase(userId?: string): Promise<string> {
  const client = createDbClient()

  try {
    // Get all table names from SQLite
    const tablesResult = await client.execute(
      `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`
    )
    const tables = tablesResult.rows.map(r => r.name as string)

    let sql = `-- Backup generated at ${new Date().toISOString()}\n-- Database: Turso/SQLite\n\n`

    for (const table of tables) {
      // Get column info
      const colResult = await client.execute({ sql: 'PRAGMA table_info(?)', args: [table] })
      const columns = colResult.rows.map(r => ({
        name: r.name as string,
        type: r.type as string,
        notnull: r.notnull as number,
        dflt_value: r.dflt_value as string | null,
        pk: r.pk as number,
      }))

      // Build CREATE TABLE statement
      const colDefs = columns.map(c => {
        let def = `"${c.name}" ${c.type || 'TEXT'}`
        if (c.notnull) def += ' NOT NULL'
        if (c.dflt_value !== null) def += ` DEFAULT ${c.dflt_value}`
        if (c.pk) def += ' PRIMARY KEY'
        return def
      }).join(', ')
      sql += `-- Table: ${table}\n`
      sql += `CREATE TABLE IF NOT EXISTS "${table}" (${colDefs});\n\n`

      // Get data
      const dataResult = await client.execute({ sql: 'SELECT * FROM "?"', args: [table] })
      if (dataResult.rows.length > 0) {
        const colNames = columns.map(c => `"${c.name}"`).join(', ')
        for (const row of dataResult.rows) {
          const values = columns.map(c => escapeSqlValue(row[c.name])).join(', ')
          sql += `INSERT INTO "${table}" (${colNames}) VALUES (${values});\n`
        }
        sql += '\n'
      }
    }

    try { if (userId) await logAudit('system.backup', undefined, undefined, { timestamp: new Date().toISOString() }, userId) } catch { /* audit log failure — non-critical */ }
    return sql
  } finally {
    client.close()
  }
}

export async function restoreDatabase(sql: string): Promise<void> {
  const userId = await requireAdmin()
  const client = createDbClient()

  try {
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    let skipped = 0
    for (const statement of statements) {
      if (!validateSqlStatement(statement)) {
        console.warn('[RESTORE] Skipping potentially dangerous statement:', statement.substring(0, 80))
        skipped++
        continue
      }
      try {
        await client.execute(statement)
      } catch (err) {
        console.error('Error executing statement:', err)
      }
    }
    if (skipped > 0) {
      console.warn(`[RESTORE] Skipped ${skipped} dangerous statements`)
    }
    try { await logAudit('system.restore', undefined, undefined, { skipped }, userId) } catch { /* audit log failure — non-critical */ }
  } finally {
    client.close()
  }
}
