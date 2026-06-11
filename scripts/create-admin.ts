import { readFileSync } from 'fs'
import * as path from 'path'
import { PGlite } from '@electric-sql/pglite'
import { PrismaPGlite } from 'pglite-prisma-adapter'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

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
  } catch { /* non-critical */ }
}
loadEnv()

const dataDir = process.env.DATABASE_DIR || '.pglite3'

async function main() {
  const pglite = new PGlite({ dataDir })
  const adapter = new PrismaPGlite(pglite)
  const prisma = new PrismaClient({ adapter })

  const envPwd: string | undefined = process.env.ADMIN_SEED_PASSWORD
  const pwd = envPwd || 'admin123'
  const passwordHash = await hash(pwd, 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { password: passwordHash, role: 'admin' },
    create: {
      id: 'admin-seed-001',
      email: 'admin@example.com',
      name: 'Admin',
      password: passwordHash,
      role: 'admin',
      image: null,
    },
  })

  process.stdout.write(`Admin created: ${admin.email} (role: ${admin.role})\n`)

  await prisma.$disconnect()
  await pglite.close()
  process.exit(0)
}

main().catch((e) => {
  console.error('Failed:', e)
  process.exit(1)
})
