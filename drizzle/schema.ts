import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Card images table - stores individual cards with their images
 * Cards are related to each other via pairId to create matching pairs
 * Only the owner/admin can manage these
 */
export const cardImages = mysqlTable("card_images", {
  id: int("id").autoincrement().primaryKey(),
  /** URL to the front face image (stored in S3) */
  frontImageUrl: text("frontImageUrl").notNull(),
  /** URL to the back face image (stored in S3) - same for all cards */
  backImageUrl: text("backImageUrl").notNull(),
  /** Display name for this card */
  name: varchar("name", { length: 255 }).notNull(),
  /** ID of the card that matches with this one (for pair matching) */
  pairId: int("pairId"),
  /** Whether this card is active/visible in games */
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CardImage = typeof cardImages.$inferSelect;
export type InsertCardImage = typeof cardImages.$inferInsert;

/**
 * Game sessions table - tracks individual game instances
 */
export const gameSessions = mysqlTable("game_sessions", {
  id: int("id").autoincrement().primaryKey(),
  /** Game mode: single, local (2 players), or online */
  mode: mysqlEnum("mode", ["single", "local", "online"]).notNull(),
  /** Current status of the game */
  status: mysqlEnum("status", ["active", "completed", "abandoned"]).default("active").notNull(),
  /** For online games, the room ID to connect players */
  roomId: varchar("roomId", { length: 64 }),
  /** Total number of moves/turns made */
  totalMoves: int("totalMoves").default(0).notNull(),
  /** Total time spent in seconds */
  totalSeconds: int("totalSeconds").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type GameSession = typeof gameSessions.$inferSelect;
export type InsertGameSession = typeof gameSessions.$inferInsert;

/**
 * Game participants - tracks which users are playing in each game
 */
export const gameParticipants = mysqlTable("game_participants", {
  id: int("id").autoincrement().primaryKey(),
  gameSessionId: int("gameSessionId").notNull(),
  userId: int("userId").notNull(),
  /** Score for this player in this game */
  score: int("score").default(0).notNull(),
  /** Number of pairs found by this player */
  pairsFound: int("pairsFound").default(0).notNull(),
  /** Placement: 1st, 2nd, etc. (null if game not completed) */
  placement: int("placement"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GameParticipant = typeof gameParticipants.$inferSelect;
export type InsertGameParticipant = typeof gameParticipants.$inferInsert;

/**
 * Game moves - tracks each move made during a game for replay/analysis
 */
export const gameMoves = mysqlTable("game_moves", {
  id: int("id").autoincrement().primaryKey(),
  gameSessionId: int("gameSessionId").notNull(),
  userId: int("userId").notNull(),
  /** Position of first card clicked (0-indexed) */
  firstCardIndex: int("firstCardIndex").notNull(),
  /** Position of second card clicked (0-indexed) */
  secondCardIndex: int("secondCardIndex").notNull(),
  /** Whether this move resulted in a match */
  isMatch: boolean("isMatch").notNull(),
  /** Timestamp when the move was made */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GameMove = typeof gameMoves.$inferSelect;
export type InsertGameMove = typeof gameMoves.$inferInsert;
