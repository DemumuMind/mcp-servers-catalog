import { prisma } from '../src/lib/db'

async function main() {
  console.log('DATABASE_DIR:', process.env.DATABASE_DIR)
  console.log('Testing prisma.server.findMany...')
  try {
    const servers = await prisma.server.findMany({ take: 1 })
    console.log('SUCCESS:', servers.length, 'servers found')
  } catch (e) {
    console.error('ERROR:', e)
  }
}

main()
