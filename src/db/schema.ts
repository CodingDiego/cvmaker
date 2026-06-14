import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import type { ResumeData } from "@/lib/cv/types";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------
export const sessionEnvEnum = pgEnum("session_env", ["prod", "preview", "local"]);
export const exportFormatEnum = pgEnum("export_format", ["pdf", "docx", "zip"]);
export const exportStatusEnum = pgEnum("export_status", [
  "pending",
  "running",
  "done",
  "error",
]);
export const emailTokenTypeEnum = pgEnum("email_token_type", ["verify", "reset"]);

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  emailVerified: boolean("email_verified").notNull().default(false),
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
  billingPlan: text("billing_plan").notNull().default("free"),
  polarCustomerId: text("polar_customer_id"),
  polarSubscriptionId: text("polar_subscription_id"),
  polarSubscriptionStatus: text("polar_subscription_status"),
  polarStateSyncedAt: timestamp("polar_state_synced_at", { withTimezone: true }),
  // AES-encrypted TOTP secret (null until 2FA is set up).
  totpSecret: text("totp_secret"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex("users_email_unique").on(t.email)]);

// ---------------------------------------------------------------------------
// Sessions — backs the "active sessions" dashboard + refresh rotation.
// ---------------------------------------------------------------------------
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // Hash of the current opaque refresh token (never store the raw token).
  refreshTokenHash: text("refresh_token_hash").notNull(),
  // Hash of the immediately-previous refresh token. Accepted for a short grace
  // window after rotation so concurrent in-flight requests (a single expiry
  // fans out into many parallel proxy refreshes) aren't mistaken for token
  // reuse and don't burn the whole family.
  prevRefreshTokenHash: text("prev_refresh_token_hash"),
  rotatedAt: timestamp("rotated_at", { withTimezone: true }),
  // Rotation lineage: all rotations of one login share a family id.
  family: uuid("family").notNull(),
  userAgent: text("user_agent"),
  ip: text("ip"),
  // Human label e.g. "Chrome on macOS".
  deviceLabel: text("device_label"),
  environment: sessionEnvEnum("environment").notNull().default("prod"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastActiveAt: timestamp("last_active_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
}, (t) => [
  index("sessions_user_idx").on(t.userId),
  index("sessions_family_idx").on(t.family),
  // For dev/localhost dedupe: one logical local session per device.
  uniqueIndex("sessions_local_dedupe")
    .on(t.userId, t.deviceLabel)
    .where(sql`environment = 'local' and revoked_at is null`),
]);

// ---------------------------------------------------------------------------
// CVs — the resume documents (structured data as JSONB).
// ---------------------------------------------------------------------------
export const cvs = pgTable("cvs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull().default("Untitled CV"),
  templateId: text("template_id").notNull().default("classic"),
  data: jsonb("data").$type<ResumeData>().notNull(),
  accentColor: text("accent_color").notNull().default("#2563eb"),
  fontFamily: text("font_family").notNull().default("inter"),
  // Public sharing: when shared, rendered PDF/DOCX live in the PUBLIC blob store
  // and the CV is viewable at /share/[userId]/[cvId].
  isPublic: boolean("is_public").notNull().default(false),
  publicPdfUrl: text("public_pdf_url"),
  publicDocxUrl: text("public_docx_url"),
  sharedAt: timestamp("shared_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("cvs_user_idx").on(t.userId)]);

// ---------------------------------------------------------------------------
// Exports — tracks Workflow DevKit export runs.
// ---------------------------------------------------------------------------
export const exports = pgTable("exports", {
  id: uuid("id").primaryKey().defaultRandom(),
  cvId: uuid("cv_id")
    .notNull()
    .references(() => cvs.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  format: exportFormatEnum("format").notNull(),
  status: exportStatusEnum("status").notNull().default("pending"),
  workflowRunId: text("workflow_run_id"),
  blobUrl: text("blob_url"),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("exports_cv_idx").on(t.cvId), index("exports_user_idx").on(t.userId)]);

// ---------------------------------------------------------------------------
// Assets — files stored in the private Blob store, optionally mirrored to the
// public store when "shared". The mirror is kept in sync via Workflow DevKit.
// ---------------------------------------------------------------------------
export const assets = pgTable("assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  contentType: text("content_type").notNull().default("application/octet-stream"),
  size: text("size"), // bytes, stored as text to avoid bigint friction
  // Private store (source of truth).
  privatePathname: text("private_pathname").notNull(),
  privateUrl: text("private_url").notNull(),
  // Public mirror (present only while shared).
  shared: boolean("shared").notNull().default(false),
  publicPathname: text("public_pathname"),
  publicUrl: text("public_url"),
  // Tracks the in-flight sync workflow (so the UI can show pending state).
  syncRunId: text("sync_run_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("assets_user_idx").on(t.userId)]);

// ---------------------------------------------------------------------------
// Email tokens — verification + password reset (single-use).
// ---------------------------------------------------------------------------
export const emailTokens = pgTable("email_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: emailTokenTypeEnum("type").notNull(),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("email_tokens_user_idx").on(t.userId)]);

// ---------------------------------------------------------------------------
// 2FA backup codes (single-use, hashed).
// ---------------------------------------------------------------------------
export const twoFactorBackupCodes = pgTable("two_factor_backup_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  codeHash: text("code_hash").notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("backup_codes_user_idx").on(t.userId)]);

// ---------------------------------------------------------------------------
// Inferred types
// ---------------------------------------------------------------------------
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type Cv = typeof cvs.$inferSelect;
export type NewCv = typeof cvs.$inferInsert;
export type ExportRow = typeof exports.$inferSelect;
export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
