import { relations } from "drizzle-orm";
import {
  servers,
  users,
  bookmarks,
  ratings,
  comments,
  viewHistories,
  notifications,
  collections,
  digestSubscriptions,
  votes,
  apiKeys,
  webhooks,
  sponsorships,
  healthChecks,
  auditLogs,
  serverRankings,
  reviews,
  reviewVotes,
} from "./schema";

export const serversRelations = relations(servers, ({ one, many }) => ({
  author: one(users, {
    fields: [servers.authorId],
    references: [users.id],
    relationName: "serverAuthor",
  }),
  bookmarks: many(bookmarks),
  ratings: many(ratings),
  comments: many(comments),
  viewHistories: many(viewHistories),
  votes: many(votes),
  sponsorship: one(sponsorships),
  healthChecks: many(healthChecks),
  serverRanking: one(serverRankings),
  reviews: many(reviews),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  servers: many(servers, { relationName: "serverAuthor" }),
  bookmarks: many(bookmarks),
  ratings: many(ratings),
  comments: many(comments),
  viewHistories: many(viewHistories),
  notifications: many(notifications),
  collections: many(collections),
  digestSubscription: one(digestSubscriptions),
  votes: many(votes),
  apiKeys: many(apiKeys),
  webhooks: many(webhooks),
  auditLogs: many(auditLogs),
  reviews: many(reviews),
  reviewVotes: many(reviewVotes),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.id],
  }),
  server: one(servers, {
    fields: [bookmarks.serverId],
    references: [servers.id],
  }),
  collection: one(collections, {
    fields: [bookmarks.collectionId],
    references: [collections.id],
  }),
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  user: one(users, {
    fields: [ratings.userId],
    references: [users.id],
  }),
  server: one(servers, {
    fields: [ratings.serverId],
    references: [servers.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  server: one(servers, {
    fields: [comments.serverId],
    references: [servers.id],
  }),
}));

export const viewHistoriesRelations = relations(viewHistories, ({ one }) => ({
  user: one(users, {
    fields: [viewHistories.userId],
    references: [users.id],
  }),
  server: one(servers, {
    fields: [viewHistories.serverId],
    references: [servers.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  user: one(users, {
    fields: [collections.userId],
    references: [users.id],
  }),
  bookmarks: many(bookmarks),
}));

export const digestSubscriptionsRelations = relations(digestSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [digestSubscriptions.userId],
    references: [users.id],
  }),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  user: one(users, {
    fields: [votes.userId],
    references: [users.id],
  }),
  server: one(servers, {
    fields: [votes.serverId],
    references: [servers.id],
  }),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
}));

export const webhooksRelations = relations(webhooks, ({ one }) => ({
  user: one(users, {
    fields: [webhooks.userId],
    references: [users.id],
  }),
}));

export const sponsorshipsRelations = relations(sponsorships, ({ one }) => ({
  server: one(servers, {
    fields: [sponsorships.serverId],
    references: [servers.id],
  }),
}));

export const healthChecksRelations = relations(healthChecks, ({ one }) => ({
  server: one(servers, {
    fields: [healthChecks.serverId],
    references: [servers.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export const serverRankingsRelations = relations(serverRankings, ({ one }) => ({
  server: one(servers, {
    fields: [serverRankings.serverId],
    references: [servers.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  server: one(servers, {
    fields: [reviews.serverId],
    references: [servers.id],
  }),
  reviewVotes: many(reviewVotes),
}));

export const reviewVotesRelations = relations(reviewVotes, ({ one }) => ({
  user: one(users, {
    fields: [reviewVotes.userId],
    references: [users.id],
  }),
  review: one(reviews, {
    fields: [reviewVotes.reviewId],
    references: [reviews.id],
  }),
}));
