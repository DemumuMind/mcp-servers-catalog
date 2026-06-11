import { readFileSync } from 'fs'
import path from 'path'
import { PGlite } from '@electric-sql/pglite'
import { hash } from 'bcryptjs'

interface ServerSeed {
  name: string
  description: string
  githubUrl: string
  category: string
  owner: string
  repo: string
  fullSlug: string
  isOfficial: boolean
  featured: boolean
  isRemote: boolean
}

const serversPath = path.resolve(__dirname, 'seed-data', 'admin-servers.json')
const SERVERS: ServerSeed[] = JSON.parse(readFileSync(serversPath, 'utf-8'))

async function main() {
  const dataDir = process.env.DATABASE_DIR || '.pglite3'
  process.stdout.write(`Seeding ${dataDir}...\n`)
  
  const pglite = new PGlite({ dataDir })
  
  const hashedPassword = await hash('admin123', 10)
  
  await pglite.query(`
    INSERT INTO "User" (id, email, password, role, "isVerifiedAuthor", "emailNotifications", "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid(),
      'admin@example.com',
      $1,
      'admin',
      true,
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT (email) DO UPDATE SET
      password = EXCLUDED.password,
      role = EXCLUDED.role
  `, [hashedPassword])
  
  process.stdout.write('Admin user created/updated: admin@example.com / admin123\n')
  
  // Insert sample servers from JSON data
  for (const server of SERVERS) {
    await pglite.query(`
      INSERT INTO "Server" (id, name, description, "githubUrl", category, owner, repo, "fullSlug", "isOfficial", featured, "isRemote", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      ON CONFLICT ("fullSlug") DO NOTHING
    `, [server.name, server.description, server.githubUrl, server.category, server.owner, server.repo, server.fullSlug, server.isOfficial, server.featured, server.isRemote])
  }
  
  process.stdout.write('Sample servers added\n')
  await pglite.close()
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
