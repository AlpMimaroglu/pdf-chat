import {
	integer,
	jsonb,
	pgTable,
	serial,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: serial().primaryKey(),
	email: varchar({ length: 255 }).notNull().unique(),
	passwordHash: text("password_hash").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
	id: serial().primaryKey(),
	userId: integer("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	ephemeralObjects: jsonb("ephemeral_objects").default([]).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const documents = pgTable("documents", {
	id: serial().primaryKey(),
	userId: integer("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	filename: varchar({ length: 500 }).notNull(),
	chunkCount: integer("chunk_count").default(0).notNull(),
	uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
	id: serial().primaryKey(),
	sessionId: integer("session_id")
		.notNull()
		.references(() => sessions.id, { onDelete: "cascade" }),
	role: varchar({ length: 20 }).notNull(), // 'user' | 'assistant'
	content: text().notNull(),
	sources: jsonb().default([]), // retrieved chunk references
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;
