import { pgTable, text, timestamp, uuid, jsonb, integer, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    username: text("username").unique().notNull(),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const words = pgTable("words", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    originalText: text("original_text").notNull(),
    meanings: jsonb("meanings").$type<string[]>().notNull(),
    examples: jsonb("examples").$type<string[]>().notNull(),
    status: text("status", { enum: ["new", "studying", "memorized"] }).default("new").notNull(),
    consecutiveCorrect: integer("consecutive_correct").default(0).notNull(),
    lastReviewedAt: timestamp("last_reviewed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
