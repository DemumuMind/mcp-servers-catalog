import { PGlite } from '@electric-sql/pglite'
import { hash } from 'bcryptjs'

async function main() {
  const dataDir = process.env.DATABASE_DIR || '.pglite3'
  console.log(`Seeding ${dataDir}...`)
  
  const pglite = new PGlite({ dataDir })
  
  // Create admin user
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
  
  console.log('Admin user created/updated: admin@example.com / admin123')
  
  // Also add some sample servers
  await pglite.query(`
    INSERT INTO "Server" (id, name, description, "githubUrl", category, owner, repo, "fullSlug", "isOfficial", featured, "isRemote", "createdAt", "updatedAt")
    VALUES 
      (gen_random_uuid(), 'Brave Search', 'MCP server for Brave Search API', 'https://github.com/modelcontextprotocol/servers', 'search', 'modelcontextprotocol', 'servers', 'modelcontextprotocol/servers', true, true, false, NOW(), NOW()),
      (gen_random_uuid(), 'Cloudflare', 'Cloudflare MCP server', 'https://github.com/cloudflare/mcp-server-cloudflare', 'cloud-service', 'cloudflare', 'mcp-server-cloudflare', 'cloudflare/mcp-server-cloudflare', true, false, false, NOW(), NOW())
    ON CONFLICT ("fullSlug") DO NOTHING
  `)
  
  console.log('Sample servers added')
  await pglite.close()
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
