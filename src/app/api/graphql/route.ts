import { createYoga, createSchema } from 'graphql-yoga'
import { db, servers, clients } from '@/lib/db'
import { eq, and, or, like, desc } from 'drizzle-orm'
import { validateApiKey } from '@/app/actions/api-keys'
import { apiRateLimit, rateLimits } from '@/lib/api-rate-limit'

const typeDefs = /* GraphQL */ `
  type Server {
    id: ID!
    name: String!
    description: String!
    owner: String!
    repo: String!
    category: String!
    tags: [String!]!
    stars: Int!
    forks: Int!
    isOfficial: Boolean!
    isSponsored: Boolean!
    isRemote: Boolean!
    featured: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Client {
    id: ID!
    name: String!
    description: String!
    url: String!
    icon: String
    featured: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    servers(
      category: String
      search: String
      featured: Boolean
      isOfficial: Boolean
      limit: Int
      offset: Int
    ): [Server!]!
    server(id: ID!): Server
    serverBySlug(owner: String!, repo: String!): Server
    clients: [Client!]!
    client(id: ID!): Client
    categories: [String!]!
  }
`

const resolvers = {
  Query: {
    async servers(
      _: any,
      args: {
        category?: string
        search?: string
        featured?: boolean
        isOfficial?: boolean
        limit?: number
        offset?: number
      }
    ) {
      const conditions = []

      if (args.category) conditions.push(eq(servers.category, args.category))
      if (args.featured !== undefined) conditions.push(eq(servers.featured, args.featured))
      if (args.isOfficial !== undefined) conditions.push(eq(servers.isOfficial, args.isOfficial))
      if (args.search) {
        conditions.push(
          or(
            like(servers.name, `%${args.search}%`),
            like(servers.description, `%${args.search}%`)
          )!
        )
      }

      const query = db
        .select()
        .from(servers)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .limit(args.limit || 50)
        .offset(args.offset || 0)
        .orderBy(desc(servers.stars))

      return query
    },

    async server(_: any, args: { id: string }) {
      const rows = await db
        .select()
        .from(servers)
        .where(eq(servers.id, args.id))
        .limit(1)
      return rows[0] || null
    },

    async serverBySlug(_: any, args: { owner: string; repo: string }) {
      const rows = await db
        .select()
        .from(servers)
        .where(eq(servers.fullSlug, `${args.owner}/${args.repo}`))
        .limit(1)
      return rows[0] || null
    },

    async clients() {
      return db.select().from(clients).orderBy(desc(clients.createdAt))
    },

    async client(_: any, args: { id: string }) {
      const rows = await db
        .select()
        .from(clients)
        .where(eq(clients.id, args.id))
        .limit(1)
      return rows[0] || null
    },

    async categories() {
      const rows = await db
        .selectDistinct({ category: servers.category })
        .from(servers)
      return rows.map((s) => s.category)
    },
  },
}

const schema = createSchema({
  typeDefs,
  resolvers,
})

const yoga = createYoga({
  schema: schema as any,
  graphqlEndpoint: '/api/graphql',
  graphiql: true,
  landingPage: false,
  context: async ({ request }) => {
    const authHeader = request.headers.get('authorization')
    let apiKeyContext = null

    if (authHeader?.startsWith('Bearer ')) {
      const key = authHeader.slice(7)
      const result = await validateApiKey(key)
      if (result.valid) {
        apiKeyContext = {
          userId: result.userId,
          permissions: result.permissions,
        }
      }
    }

    return { apiKey: apiKeyContext }
  },
})

const checkGraphQLRateLimit = apiRateLimit(rateLimits.graphql)

export async function GET(request: Request) {
  const limited = await checkGraphQLRateLimit(request)
  if (limited) return limited
  return yoga(request)
}

export async function POST(request: Request) {
  const limited = await checkGraphQLRateLimit(request)
  if (limited) return limited
  return yoga(request)
}
