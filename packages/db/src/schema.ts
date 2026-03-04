import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";

export const planEnum = pgEnum("plan", ["free", "indie", "pro"]);
export const roleEnum = pgEnum("role", ["owner", "admin", "member"]);
export const exitedByEnum = pgEnum("exited_by", ["admin", "expiry", "timeout"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "canceled",
  "past_due",
]);

// ── Workspaces ──────────────────────────────────────────────────────
export const workspaces = pgTable("workspaces", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  plan: planEnum("plan").default("free").notNull(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Users ───────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Workspace Members ───────────────────────────────────────────────
export const workspaceMembers = pgTable(
  "workspace_members",
  {
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id)
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    role: roleEnum("role").notNull(),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.workspaceId, table.userId] })],
);

// ── API Keys ────────────────────────────────────────────────────────
export const apiKeys = pgTable("api_keys", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .references(() => workspaces.id)
    .notNull(),
  keyHash: varchar("key_hash", { length: 64 }).notNull(),
  keyPrefix: varchar("key_prefix", { length: 8 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  revokedAt: timestamp("revoked_at"),
});

// ── Impersonation Tokens ────────────────────────────────────────────
export const impersonationTokens = pgTable("impersonation_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .references(() => workspaces.id)
    .notNull(),
  adminId: uuid("admin_id").notNull(),
  targetUserId: uuid("target_user_id").notNull(),
  tokenHash: varchar("token_hash", { length: 64 }).notNull(),
  nonce: varchar("nonce", { length: 64 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Impersonation Sessions ──────────────────────────────────────────
export const impersonationSessions = pgTable("impersonation_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .references(() => workspaces.id)
    .notNull(),
  tokenId: uuid("token_id")
    .references(() => impersonationTokens.id)
    .notNull(),
  adminId: uuid("admin_id").notNull(),
  targetUserId: uuid("target_user_id").notNull(),
  ip: varchar("ip", { length: 45 }),
  userAgent: text("user_agent"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
  exitedBy: exitedByEnum("exited_by"),
});

// ── Subscriptions ───────────────────────────────────────────────────
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .references(() => workspaces.id)
    .unique()
    .notNull(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).notNull(),
  stripeSubId: varchar("stripe_sub_id", { length: 255 }).notNull(),
  plan: planEnum("plan").notNull(),
  status: subscriptionStatusEnum("status").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
