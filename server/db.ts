import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, cardImages, gameSessions, gameParticipants, gameMoves, InsertCardImage, InsertGameSession, InsertGameParticipant, InsertGameMove } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Card Images queries
export async function getAllActiveCardImages() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(cardImages).where(eq(cardImages.isActive, true));
}

export async function getAllCardImages() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(cardImages);
}

export async function createCardImage(data: InsertCardImage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(cardImages).values(data);
  return result;
}

export async function deleteCardImage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(cardImages).where(eq(cardImages.id, id));
}

export async function updateCardImageStatus(id: number, isActive: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(cardImages).set({ isActive }).where(eq(cardImages.id, id));
}

// Game Sessions queries
export async function createGameSession(data: InsertGameSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(gameSessions).values(data);
  return result;
}

export async function getGameSession(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(gameSessions).where(eq(gameSessions.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getGameSessionByRoomId(roomId: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(gameSessions).where(eq(gameSessions.roomId, roomId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateGameSession(id: number, data: Partial<InsertGameSession>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(gameSessions).set(data).where(eq(gameSessions.id, id));
}

// Game Participants queries
export async function addGameParticipant(data: InsertGameParticipant) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(gameParticipants).values(data);
}

export async function getGameParticipants(gameSessionId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(gameParticipants).where(eq(gameParticipants.gameSessionId, gameSessionId));
}

export async function updateParticipantScore(id: number, score: number, pairsFound: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(gameParticipants).set({ score, pairsFound }).where(eq(gameParticipants.id, id));
}

// Game Moves queries
export async function recordGameMove(data: InsertGameMove) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(gameMoves).values(data);
}

export async function getGameMoves(gameSessionId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(gameMoves).where(eq(gameMoves.gameSessionId, gameSessionId));
}
