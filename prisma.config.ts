import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'
import { PGlite } from '@electric-sql/pglite'
import { PrismaPGlite } from 'pglite-prisma-adapter'

type Env = {
  DATABASE_URL: string
  DATABASE_DIR: string
}

export default defineConfig({
  earlyAccess: true,
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'npx tsx prisma/seed.ts',
  },
  datasource: {
    url: env<Env>('DATABASE_URL'),
  },
  migrate: {
    async adapter(environment) {
      const client = new PGlite({ dataDir: environment.DATABASE_DIR })
      return new PrismaPGlite(client)
    },
  },
  studio: {
    async adapter(environment) {
      const client = new PGlite({ dataDir: environment.DATABASE_DIR })
      return new PrismaPGlite(client)
    },
  },
})
