import { sql } from "drizzle-orm";
import { text, integer, sqliteTable, real } from "drizzle-orm/sqlite-core";

export const books = sqliteTable("books", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  price: real("price").notNull(),
  cover_url: text("cover_url"),
  description: text("description"),
  condition: text("condition", { enum: ['novo', 'seminovo', 'usado'] }).notNull(),
  genre: text("genre"),
  available: integer("available", { mode: "boolean" }).notNull().default(true),
  created_at: text("created_at").notNull().default(sql`(current_timestamp)`),
  updated_at: text("updated_at").notNull().default(sql`(current_timestamp)`),
});