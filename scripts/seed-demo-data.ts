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
  } catch (_err) {
    // .env file is optional — skip if missing
  }
}
loadEnv()

function getDataDir(): string {
  const dir = process.env.DATABASE_DIR?.trim()
  return dir ? path.resolve(dir) : path.resolve(process.cwd(), '.pglite3')
}

function createPrisma() {
  const dataDir = getDataDir()
  process.stdout.write(`Using database directory: ${dataDir}\n`)
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
    process.stdout.write(`Created user: ${user.email} (${user.id})\n`)
  }

  const servers = await prisma.server.findMany({ select: { id: true, name: true } })
  process.stdout.write(`Found ${servers.length} servers to seed\n`)

  let commentsCreated = 0
  let ratingsCreated = 0
  let bookmarksCreated = 0

  for (const server of servers) {
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
      } catch (_e) {
        // duplicate key — expected when re-seeding
      }
    }

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
      } catch (_e) {
        // duplicate key — expected when re-seeding
      }
    }
  }

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
      } catch (_e) {
        // duplicate key — expected when re-seeding
      }
    }
  }

  process.stdout.write('\n--- Demo data seeded ---\n')
  process.stdout.write(`Users:     ${users.length}\n`)
  process.stdout.write(`Comments:  ${commentsCreated}\n`)
  process.stdout.write(`Ratings:   ${ratingsCreated}\n`)
  process.stdout.write(`Bookmarks: ${bookmarksCreated}\n`)

  await prisma.$disconnect()
  await pglite.close()
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
