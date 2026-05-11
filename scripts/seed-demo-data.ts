import { readFileSync } from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'
import { PGlite } from '@electric-sql/pglite'
import { PrismaPGlite } from 'pglite-prisma-adapter'
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
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      if (process.env[key] === undefined) {
        process.env[key] = value
      }
    }
  } catch {
    // ignore
  }
}
loadEnv()

function getDataDir(): string {
  const dir = process.env.DATABASE_DIR?.trim()
  return dir ? path.resolve(dir) : path.resolve(process.cwd(), '.pglite3')
}

function createPrisma() {
  const dataDir = getDataDir()
  console.log(`Using database directory: ${dataDir}`)
  const pglite = new PGlite({ dataDir })
  const adapter = new PrismaPGlite(pglite)
  return { prisma: new PrismaClient({ adapter }), pglite }
}

const { prisma, pglite } = createPrisma()

const DEMO_USERS = [
  { email: 'demo1@example.com', name: 'Алексей' },
  { email: 'demo2@example.com', name: 'Мария' },
  { email: 'demo3@example.com', name: 'Иван' },
]

const COMMENT_TEMPLATES = [
  'Отличный сервер, интеграция прошла без проблем!',
  'Использую уже неделю, работает стабильно.',
  'README не очень понятный, но сам сервер хороший.',
  'Хорошая документация и примеры использования.',
  'Не хватает поддержки Cursor, в остальном отлично.',
  'Очень полезно для автоматизации рабочих задач.',
  'Быстрая установка через npx, рекомендую.',
  'Иногда падает при большой нагрузке, но в целом норм.',
  'Отлично работает с Claude Desktop.',
  'Нужно больше примеров на TypeScript.',
  'Great integration, love the examples!',
  'Easy setup and very responsive developer.',
  'Could use better error messages but works well.',
  'My favorite MCP server so far.',
]

function sample<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function main() {
  // Create demo users
  const users: Array<{ id: string; email: string; name: string }> = []
  for (const u of DEMO_USERS) {
    const password = await hash('demo123', 10)
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        password,
        role: 'user',
        provider: 'credentials',
      },
    })
    users.push({ id: user.id, email: user.email, name: user.name || '' })
    console.log(`Created user: ${user.email} (${user.id})`)
  }

  // Get all servers
  const servers = await prisma.server.findMany({ select: { id: true, name: true } })
  console.log(`Found ${servers.length} servers to seed`)

  let commentsCreated = 0
  let ratingsCreated = 0
  let bookmarksCreated = 0

  for (const server of servers) {
    // 0-2 comments per server
    const commentCount = randInt(0, 2)
    for (const user of sample(users, commentCount)) {
      const content = sample(COMMENT_TEMPLATES, 1)[0]
      try {
        await prisma.comment.create({
          data: {
            userId: user.id,
            serverId: server.id,
            content,
          },
        })
        commentsCreated++
      } catch (e) {
        // ignore duplicates etc
      }
    }

    // 0-2 ratings per server
    const ratingCount = randInt(0, 2)
    for (const user of sample(users, ratingCount)) {
      try {
        await prisma.rating.create({
          data: {
            userId: user.id,
            serverId: server.id,
            value: randInt(3, 5),
          },
        })
        ratingsCreated++
      } catch (e) {
        // ignore duplicates
      }
    }

    // Each user bookmarks 5-10 random servers
    // We'll do this globally after
  }

  // Bookmarks: each user gets 5-10 random servers
  for (const user of users) {
    const bookmarkServers = sample(servers, randInt(5, 10))
    for (const server of bookmarkServers) {
      try {
        await prisma.bookmark.create({
          data: {
            userId: user.id,
            serverId: server.id,
          },
        })
        bookmarksCreated++
      } catch (e) {
        // ignore duplicates
      }
    }
  }

  console.log('\n--- Demo data seeded ---')
  console.log(`Users:     ${users.length}`)
  console.log(`Comments:  ${commentsCreated}`)
  console.log(`Ratings:   ${ratingsCreated}`)
  console.log(`Bookmarks: ${bookmarksCreated}`)

  await prisma.$disconnect()
  await pglite.close()
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
