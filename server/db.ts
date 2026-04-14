import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  dealerships,
  InsertDealership,
  complianceAnswers,
  InsertComplianceAnswer,
  subscriptions,
  InsertSubscription,
  generatedDocuments,
  InsertGeneratedDocument,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

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
      values.role = "admin";
      updateSet.role = "admin";
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

// Dealership queries
export async function createDealership(dealership: InsertDealership) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(dealerships).values(dealership);
  return result;
}

export async function getDealershipByUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(dealerships)
    .where(eq(dealerships.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateDealership(id: number, data: Partial<InsertDealership>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(dealerships).set(data).where(eq(dealerships.id, id));
}

// Compliance answers queries
export async function saveComplianceAnswer(answer: InsertComplianceAnswer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(complianceAnswers).values(answer).onDuplicateKeyUpdate({
    set: {
      answers: answer.answers,
      score: answer.score,
      completed: answer.completed,
      completedAt: answer.completedAt,
    },
  });
}

export async function getComplianceAnswers(dealershipId: number, section: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(complianceAnswers)
    .where(and(eq(complianceAnswers.dealershipId, dealershipId), eq(complianceAnswers.section, section)))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getAllComplianceAnswers(dealershipId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(complianceAnswers).where(eq(complianceAnswers.dealershipId, dealershipId));
}

// Subscription queries
export async function getSubscription(dealershipId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.dealershipId, dealershipId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function createSubscription(subscription: InsertSubscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(subscriptions).values(subscription);
}

export async function updateSubscription(id: number, data: Partial<InsertSubscription>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(subscriptions).set(data).where(eq(subscriptions.id, id));
}

// Generated documents queries
export async function saveGeneratedDocument(doc: InsertGeneratedDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(generatedDocuments).values(doc);
}

export async function getGeneratedDocuments(dealershipId: number, docType?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (docType) {
    return await db
      .select()
      .from(generatedDocuments)
      .where(and(eq(generatedDocuments.dealershipId, dealershipId), eq(generatedDocuments.docType, docType)));
  }

  return await db.select().from(generatedDocuments).where(eq(generatedDocuments.dealershipId, dealershipId));
}
