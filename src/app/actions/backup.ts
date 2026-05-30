'use server'

import { PGlite } from '@electric-sql/pglite'
import path from 'path'

const DANGEROUS_SQL_PATTERNS = [
  /\bDROP\b/i,
  /\bDELETE\b/i,
  /\bTRUNCATE\b/i,
  /\bALTER\b/i,
  /\bGRANT\b/i,
  /\bREVOKE\b/i,
  /\bCOPY\b/i,
  /\bEXECUTE\b/i,
  /\bVACUUM\b/i,
  /\bREINDEX\b/i,
  /\bCLUSTER\b/i,
  /\bREFRESH\b/i,
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

export async function backupDatabase(): Promise<string> {
  const dataDir = process.env.DATABASE_DIR
    ? path.resolve(process.env.DATABASE_DIR)
    : path.resolve(process.cwd(), '.pglite')

  const db = new PGlite({ dataDir })

  try {
    // Get all tables
    const tablesResult = await db.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename NOT LIKE 'pg_%' 
      AND tablename NOT LIKE '_pg_%'
    `)

    const tables = tablesResult.rows.map((r: any) => r.tablename)
    
    let sql = `-- Backup generated at ${new Date().toISOString()}\n\n`
    
    for (const table of tables) {
      // Get table schema
      const schemaResult = await db.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = '${table}'
        ORDER BY ordinal_position
      `)
      
      const columns = schemaResult.rows.map((r: any) => {
        let def = `${r.column_name} ${r.data_type}`
        if (r.is_nullable === 'NO') def += ' NOT NULL'
        if (r.column_default) def += ` DEFAULT ${r.column_default}`
        return def
      }).join(', ')
      
      sql += `-- Table: ${table}\n`
      sql += `CREATE TABLE IF NOT EXISTS "${table}" (${columns});\n\n`
      
      // Get data
      const dataResult = await db.query(`SELECT * FROM "${table}"`)
      
      if (dataResult.rows.length > 0) {
        const columnNames = Object.keys(dataResult.rows[0] as Record<string, unknown>).map(c => `"${c}"`).join(', ')
        
        for (const row of dataResult.rows) {
          const values = Object.values(row as Record<string, unknown>).map(v => {
            if (v === null) return 'NULL'
            if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE'
            if (v instanceof Date) return `'${v.toISOString()}'`
            if (Array.isArray(v)) return `ARRAY[${v.map(item => `'${String(item).replace(/'/g, "''")}'`).join(', ')}]`
            return `'${String(v).replace(/'/g, "''")}'`
          }).join(', ')
          
          sql += `INSERT INTO "${table}" (${columnNames}) VALUES (${values});\n`
        }
        sql += '\n'
      }
    }
    
    return sql
  } finally {
    await db.close()
  }
}

export async function restoreDatabase(sql: string): Promise<void> {
  const dataDir = process.env.DATABASE_DIR
    ? path.resolve(process.env.DATABASE_DIR)
    : path.resolve(process.cwd(), '.pglite')

  const db = new PGlite({ dataDir })

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
        await db.query(statement + ';')
      } catch (err) {
        console.error('Error executing statement:', err)
      }
    }
    if (skipped > 0) {
      console.warn(`[RESTORE] Skipped ${skipped} dangerous statements`)
    }
  } finally {
    await db.close()
  }
}
