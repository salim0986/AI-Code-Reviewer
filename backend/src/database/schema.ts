import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  integer,
  text,
  jsonb,
  vector,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// --- EXISTING AUTH TABLES ---

// Users Table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  isVerified: boolean('is_verified').default(false).notNull(),
  githubId: varchar('github_id', { length: 255 }).unique(),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at'),
  lastLoginIp: varchar('last_login_ip', { length: 45 }),
});

// Email Verification Tokens Table
export const emailVerificationTokens = pgTable('email_verification_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Password Reset Tokens Table
export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Refresh Tokens Table
export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 500 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  userAgent: varchar('user_agent', { length: 500 }),
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Login History Table
export const loginHistory = pgTable('login_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  ipAddress: varchar('ip_address', { length: 45 }).notNull(),
  userAgent: varchar('user_agent', { length: 500 }),
  loginAt: timestamp('login_at').defaultNow().notNull(),
  wasNotified: boolean('was_notified').default(false).notNull(),
});

// --- NEW SENTINEL AI TABLES ---

// API Keys Table
export const apiKeys = pgTable('api_keys', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: text('key').unique().notNull(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Repositories Table
export const repositories = pgTable('repositories', {
  id: uuid('id').defaultRandom().primaryKey(),
  githubRepoId: integer('github_repo_id').unique().notNull(),
  name: text('name').notNull(), // e.g. "facebook/react"
  ownerId: uuid('owner_id')
    .references(() => users.id)
    .notNull(),

  // RAG Status
  isIndexed: boolean('is_indexed').default(false),
  lastIndexedAt: timestamp('last_indexed_at'),
});

// Reviews Table
export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  repoId: uuid('repo_id')
    .references(() => repositories.id)
    .notNull(),

  // GitHub Context
  prNumber: integer('pr_number').notNull(),
  commitHash: text('commit_hash').notNull(),

  // AI Analysis Output
  score: integer('score'),
  summary: text('summary'),
  securityIssues: jsonb('security_issues'), // Structured list of vulnerabilities

  createdAt: timestamp('created_at').defaultNow(),
});

// OPTIONAL: Document Chunks (For RAG/Vector Search)
export const documentChunks = pgTable('document_chunks', {
  id: uuid('id').defaultRandom().primaryKey(),
  repoId: uuid('repo_id')
    .references(() => repositories.id)
    .notNull(),
  content: text('content').notNull(),
  filePath: text('file_path').notNull(),
  // Vector column (requires pgvector extension enabled in DB)
  embedding: vector('embedding', { dimensions: 1536 }),
});

// --- RELATIONS ---

export const usersRelations = relations(users, ({ many }) => ({
  // Existing relations
  emailVerificationTokens: many(emailVerificationTokens),
  passwordResetTokens: many(passwordResetTokens),
  refreshTokens: many(refreshTokens),
  loginHistory: many(loginHistory),

  // New Sentinel relations
  apiKeys: many(apiKeys),
  repositories: many(repositories),
  reviews: many(reviews),
}));

// Relation definitions for Auth tables
export const emailVerificationTokensRelations = relations(
  emailVerificationTokens,
  ({ one }) => ({
    user: one(users, {
      fields: [emailVerificationTokens.userId],
      references: [users.id],
    }),
  }),
);

export const passwordResetTokensRelations = relations(
  passwordResetTokens,
  ({ one }) => ({
    user: one(users, {
      fields: [passwordResetTokens.userId],
      references: [users.id],
    }),
  }),
);

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

export const loginHistoryRelations = relations(loginHistory, ({ one }) => ({
  user: one(users, {
    fields: [loginHistory.userId],
    references: [users.id],
  }),
}));

// Relation definitions for Sentinel tables
export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
}));

export const repositoriesRelations = relations(
  repositories,
  ({ one, many }) => ({
    owner: one(users, {
      fields: [repositories.ownerId],
      references: [users.id],
    }),
    reviews: many(reviews),
  }),
);

export const reviewsRelations = relations(reviews, ({ one }) => ({
  repository: one(repositories, {
    fields: [reviews.repoId],
    references: [repositories.id],
  }),
}));

// --- TYPES ---

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type EmailVerificationToken =
  typeof emailVerificationTokens.$inferSelect;
export type NewEmailVerificationToken =
  typeof emailVerificationTokens.$inferInsert;

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;

export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;

export type LoginHistory = typeof loginHistory.$inferSelect;
export type NewLoginHistory = typeof loginHistory.$inferInsert;

export type Repository = typeof repositories.$inferSelect;
export type NewRepository = typeof repositories.$inferInsert;

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
