import { createYoga, createSchema } from 'graphql-yoga'
import { prisma } from '@/lib/db'
import { validateApiKey } from '@/app/actions/api-keys'
import { apiRateLimit, rateLimits } from '@/lib/api-rate-limit'
import { NextResponse } from 'next/server'

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
      _: unknown,
      args: {
        category?: string
        search?: string
        featured?: boolean
        isOfficial?: boolean
        limit?: number
        offset?: number
      }
    ) {
      const where: Record<string, unknown> = {}
      
      if (args.category) where.category = args.category
      if (args.featured !== undefined) where.featured = args.featured
      if (args.isOfficial !== undefined) where.isOfficial = args.isOfficial
      if (args.search) {
        where.OR = [
          { name: { contains: args.search, mode: 'insensitive' } },
          { description: { contains: args.search, mode: 'insensitive' } },
        ]
      }

      const servers = await prisma.server.findMany({
        where,
        take: args.limit || 50,
        skip: args.offset || 0,
        orderBy: { stars: 'desc' },
      })

      return servers
    },

    async server(_: unknown, args: { id: string }) {
      return prisma.server.findUnique({ where: { id: args.id } })
    },

    async serverBySlug(_: unknown, args: { owner: string; repo: string }) {
      return prisma.server.findUnique({
        where: { fullSlug: `${args.owner}/${args.repo}` },
      })
    },

    async clients() {
      return prisma.client.findMany({ orderBy: { createdAt: 'desc' } })
    },

    async client(_: unknown, args: { id: string }) {
      return prisma.client.findUnique({ where: { id: args.id } })
    },

    async categories() {
      const servers = await prisma.server.findMany({
        select: { category: true },
        distinct: ['category'],
      })
      return servers.map((s) => s.category)
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
