import {
  sqliteTable,
  text,
  integer,
  real,
  uniqueIndex,
  index,
} from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

// ─── Helper: generate CUID-like IDs ─────────────────────────────────────────
// We use a simple nano-id style generator; drizzle-orm provides cuid2 via
// `text().$default(() => createId())` but we keep it explicit so there's no
// hidden runtime dep.

// ─── Tables ──────────────────────────────────────────────────────────────────

export const servers = sqliteTable('Server', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  description: text('description').notNull(),
  owner: text('owner').notNull(),
  repo: text('repo').notNull(),
  fullSlug: text('fullSlug').notNull().unique(),
  category: text('category').notNull(),
  isOfficial: integer('isOfficial', { mode: 'boolean' }).notNull().default(false),
  isSponsored: integer('isSponsored', { mode: 'boolean' }).notNull().default(false),
  githubUrl: text('githubUrl').notNull(),
  tags: text('tags', { mode: 'json' }).$type<string[]>().notNull().default([]),
  isRemote: integer('isRemote', { mode: 'boolean' }).notNull().default(false),
  authType: text('authType'),
  endpoint: text('endpoint'),
  featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
  featuredUntil: integer('featuredUntil', { mode: 'timestamp' }),
  sponsoredUntil: integer('sponsoredUntil', { mode: 'timestamp' }),
  stars: integer('stars').notNull().default(0),
  forks: integer('forks').notNull().default(0),
  authorId: text('authorId'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, (table) => [
  index('Server_category_featured_stars_idx').on(table.category, table.featured, table.stars),
  index('Server_isOfficial_idx').on(table.isOfficial),
  index('Server_isRemote_idx').on(table.isRemote),
  index('Server_authorId_idx').on(table.authorId),
  index('Server_createdAt_idx').on(table.createdAt),
])

export const users = sqliteTable('User', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  password: text('password'),
  name: text('name'),
  image: text('image'),
  role: text('role').notNull().default('user'),
  provider: text('provider').notNull().default('credentials'),
  isVerifiedAuthor: integer('isVerifiedAuthor', { mode: 'boolean' }).notNull().default(false),
  emailNotifications: integer('emailNotifications', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()).$onUpdate(() => new Date()),
})

export const clients = sqliteTable('Client', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  description: text('description').notNull(),
  url: text('url').notNull(),
  icon: text('icon'),
  featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()).$onUpdate(() => new Date()),
})

export const bookmarks = sqliteTable('Bookmark', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  serverId: text('serverId').notNull().references(() => servers.id, { onDelete: 'cascade' }),
  collectionId: text('collectionId').references(() => collections.id),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (table) => [
  uniqueIndex('Bookmark_userId_serverId_key').on(table.userId, table.serverId),
])

export const ratings = sqliteTable('Rating', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  serverId: text('serverId').notNull().references(() => servers.id, { onDelete: 'cascade' }),
  value: integer('value').notNull(), // 1-5 stars
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, (table) => [
  uniqueIndex('Rating_userId_serverId_key').on(table.userId, table.serverId),
])

export const comments = sqliteTable('Comment', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  serverId: text('serverId').notNull().references(() => servers.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  isModerated: integer('isModerated', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()).$onUpdate(() => new Date()),
})

export const viewHistories = sqliteTable('ViewHistory', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  serverId: text('serverId').notNull().references(() => servers.id, { onDelete: 'cascade' }),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (table) => [
  uniqueIndex('ViewHistory_userId_serverId_key').on(table.userId, table.serverId),
  index('ViewHistory_userId_createdAt_idx').on(table.userId, table.createdAt),
])

export const submissions = sqliteTable('Submission', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  description: text('description').notNull(),
  url: text('url').notNull(),
  category: text('category').notNull(),
  tags: text('tags', { mode: 'json' }).$type<string[]>().notNull().$defaultFn(() => []),
  owner: text('owner'),
  email: text('email').notNull(),
  premium: integer('premium', { mode: 'boolean' }).notNull().default(false),
  status: text('status').notNull().default('pending'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()).$onUpdate(() => new Date()),
})

export const notifications = sqliteTable('Notification', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  link: text('link'),
  read: integer('read', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (table) => [
  index('Notification_userId_read_createdAt_idx').on(table.userId, table.read, table.createdAt),
])

export const collections = sqliteTable('Collection', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  isPublic: integer('isPublic', { mode: 'boolean' }).notNull().default(false),
  shareSlug: text('shareSlug').unique(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, (table) => [
  index('Collection_userId_idx').on(table.userId),
  index('Collection_shareSlug_idx').on(table.shareSlug),
])

export const digestSubscriptions = sqliteTable('DigestSubscription', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('userId').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  frequency: text('frequency').notNull().default('weekly'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  category: text('category'), // null = all categories
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const votes = sqliteTable('Vote', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  serverId: text('serverId').notNull().references(() => servers.id, { onDelete: 'cascade' }),
  value: integer('value').notNull(), // 1 = upvote, -1 = downvote
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (table) => [
  uniqueIndex('Vote_userId_serverId_key').on(table.userId, table.serverId),
])

export const apiKeys = sqliteTable('ApiKey', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  keyHash: text('keyHash').notNull().unique(),
  keyPrefix: text('keyPrefix').notNull(),
  permissions: text('permissions', { mode: 'json' }).$type<string[]>().notNull().default(['read']),
  lastUsedAt: integer('lastUsedAt', { mode: 'timestamp' }),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }),
  revoked: integer('revoked', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (table) => [
  index('ApiKey_userId_idx').on(table.userId),
  index('ApiKey_keyHash_idx').on(table.keyHash),
])

export const webhooks = sqliteTable('Webhook', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  secret: text('secret').notNull(),
  events: text('events', { mode: 'json' }).$type<string[]>().notNull().default(['server.created', 'server.updated']),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  lastError: text('lastError'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, (table) => [
  index('Webhook_userId_idx').on(table.userId),
])

export const sponsorships = sqliteTable('Sponsorship', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  serverId: text('serverId').notNull().unique().references(() => servers.id, { onDelete: 'cascade' }),
  sponsorName: text('sponsorName').notNull(),
  sponsorUrl: text('sponsorUrl'),
  sponsorLogo: text('sponsorLogo'),
  startDate: integer('startDate', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  endDate: integer('endDate', { mode: 'timestamp' }),
  amount: real('amount'),
  currency: text('currency').notNull().default('USD'),
  notes: text('notes'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, (table) => [
  index('Sponsorship_serverId_idx').on(table.serverId),
  index('Sponsorship_active_endDate_idx').on(table.active, table.endDate),
])

export const healthChecks = sqliteTable('HealthCheck', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  serverId: text('serverId').notNull().references(() => servers.id, { onDelete: 'cascade' }),
  status: text('status').notNull(), // online, degraded, offline
  latency: integer('latency'), // ms
  error: text('error'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (table) => [
  index('HealthCheck_serverId_createdAt_idx').on(table.serverId, table.createdAt),
])

export const auditLogs = sqliteTable('AuditLog', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('userId').references(() => users.id, { onDelete: 'set null' }),
  action: text('action').notNull(), // e.g. server.create, server.delete, user.verify
  targetType: text('targetType'), // e.g. Server, User, Comment
  targetId: text('targetId'),
  details: text('details'), // JSON string with additional context
  ip: text('ip'),
  userAgent: text('userAgent'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (table) => [
  index('AuditLog_userId_createdAt_idx').on(table.userId, table.createdAt),
  index('AuditLog_action_createdAt_idx').on(table.action, table.createdAt),
  index('AuditLog_targetType_targetId_idx').on(table.targetType, table.targetId),
])

export const searchQueries = sqliteTable('SearchQuery', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  query: text('query').notNull(),
  results: integer('results').notNull().default(0),
  userId: text('userId'),
  source: text('source').notNull().default('web'), // web, api, graphql
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (table) => [
  index('SearchQuery_query_idx').on(table.query),
  index('SearchQuery_createdAt_idx').on(table.createdAt),
  index('SearchQuery_results_idx').on(table.results),
])

export const serverRankings = sqliteTable('ServerRanking', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  serverId: text('serverId').notNull().references(() => servers.id, { onDelete: 'cascade' }),
  period: text('period').notNull(), // week, month
  rank: integer('rank').notNull(),
  score: real('score').notNull(),
  views: integer('views').notNull().default(0),
  bookmarks: integer('bookmarks').notNull().default(0),
  ratings: integer('ratings').notNull().default(0),
  startDate: integer('startDate', { mode: 'timestamp' }).notNull(),
  endDate: integer('endDate', { mode: 'timestamp' }).notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (table) => [
  index('ServerRanking_period_startDate_idx').on(table.period, table.startDate),
  index('ServerRanking_rank_idx').on(table.rank),
  index('ServerRanking_serverId_period_unique').on(table.serverId, table.period),
])

export const reviews = sqliteTable('Review', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  serverId: text('serverId').notNull().references(() => servers.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  helpfulCount: integer('helpfulCount').notNull().default(0),
  notHelpfulCount: integer('notHelpfulCount').notNull().default(0),
  isModerated: integer('isModerated', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, (table) => [
  uniqueIndex('Review_userId_serverId_key').on(table.userId, table.serverId),
  index('Review_serverId_createdAt_idx').on(table.serverId, table.createdAt),
])

export const reviewVotes = sqliteTable('ReviewVote', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  reviewId: text('reviewId').notNull().references(() => reviews.id, { onDelete: 'cascade' }),
  helpful: integer('helpful', { mode: 'boolean' }).notNull(), // true = helpful, false = not helpful
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (table) => [
  uniqueIndex('ReviewVote_userId_reviewId_key').on(table.userId, table.reviewId),
])

// ─── Relations ───────────────────────────────────────────────────────────────

export const serverRelations = relations(servers, ({ one, many }) => ({
  author: one(users, {
    fields: [servers.authorId],
    references: [users.id],
    relationName: 'authoredServers',
  }),
  bookmarks: many(bookmarks),
  ratings: many(ratings),
  comments: many(comments),
  viewHistory: many(viewHistories),
  votes: many(votes),
  sponsorship: one(sponsorships),
  healthChecks: many(healthChecks),
  reviews: many(reviews),
  rankings: many(serverRankings),
}))

export const userRelations = relations(users, ({ one, many }) => ({
  bookmarks: many(bookmarks),
  ratings: many(ratings),
  comments: many(comments),
  viewHistory: many(viewHistories),
  notifications: many(notifications),
  collections: many(collections),
  digestSubscription: one(digestSubscriptions),
  votes: many(votes),
  apiKeys: many(apiKeys),
  webhooks: many(webhooks),
  authoredServers: many(servers),
  reviews: many(reviews),
  reviewVotes: many(reviewVotes),
  auditLogs: many(auditLogs),
}))

export const bookmarkRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, { fields: [bookmarks.userId], references: [users.id] }),
  server: one(servers, { fields: [bookmarks.serverId], references: [servers.id] }),
  collection: one(collections, { fields: [bookmarks.collectionId], references: [collections.id] }),
}))

export const ratingRelations = relations(ratings, ({ one }) => ({
  user: one(users, { fields: [ratings.userId], references: [users.id] }),
  server: one(servers, { fields: [ratings.serverId], references: [servers.id] }),
}))

export const commentRelations = relations(comments, ({ one }) => ({
  user: one(users, { fields: [comments.userId], references: [users.id] }),
  server: one(servers, { fields: [comments.serverId], references: [servers.id] }),
}))

export const viewHistoryRelations = relations(viewHistories, ({ one }) => ({
  user: one(users, { fields: [viewHistories.userId], references: [users.id] }),
  server: one(servers, { fields: [viewHistories.serverId], references: [servers.id] }),
}))

export const notificationRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}))

export const collectionRelations = relations(collections, ({ one, many }) => ({
  user: one(users, { fields: [collections.userId], references: [users.id] }),
  bookmarks: many(bookmarks),
}))

export const digestSubscriptionRelations = relations(digestSubscriptions, ({ one }) => ({
  user: one(users, { fields: [digestSubscriptions.userId], references: [users.id] }),
}))

export const voteRelations = relations(votes, ({ one }) => ({
  user: one(users, { fields: [votes.userId], references: [users.id] }),
  server: one(servers, { fields: [votes.serverId], references: [servers.id] }),
}))

export const apiKeyRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, { fields: [apiKeys.userId], references: [users.id] }),
}))

export const webhookRelations = relations(webhooks, ({ one }) => ({
  user: one(users, { fields: [webhooks.userId], references: [users.id] }),
}))

export const sponsorshipRelations = relations(sponsorships, ({ one }) => ({
  server: one(servers, { fields: [sponsorships.serverId], references: [servers.id] }),
}))

export const healthCheckRelations = relations(healthChecks, ({ one }) => ({
  server: one(servers, { fields: [healthChecks.serverId], references: [servers.id] }),
}))

export const auditLogRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, { fields: [auditLogs.userId], references: [users.id] }),
}))

export const serverRankingRelations = relations(serverRankings, ({ one }) => ({
  server: one(servers, { fields: [serverRankings.serverId], references: [servers.id] }),
}))

export const reviewRelations = relations(reviews, ({ one, many }) => ({
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
  server: one(servers, { fields: [reviews.serverId], references: [servers.id] }),
  votes: many(reviewVotes),
}))

export const reviewVoteRelations = relations(reviewVotes, ({ one }) => ({
  user: one(users, { fields: [reviewVotes.userId], references: [users.id] }),
  review: one(reviews, { fields: [reviewVotes.reviewId], references: [reviews.id] }),
}))
