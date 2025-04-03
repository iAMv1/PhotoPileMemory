import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const wishes = pgTable("wishes", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  style: text("style").notNull(),
  topPosition: integer("top_position").notNull(),
  leftPosition: integer("left_position").notNull(),
  rotation: integer("rotation").notNull(),
  fontSize: text("font_size").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWishSchema = createInsertSchema(wishes).omit({
  id: true,
  createdAt: true,
});

export const timeCapsuleMessages = pgTable("time_capsule_messages", {
  id: serial("id").primaryKey(),
  hour: integer("hour").notNull(),
  message: text("message").notNull(),
});

export const insertTimeCapsuleMessageSchema = createInsertSchema(timeCapsuleMessages).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertWish = z.infer<typeof insertWishSchema>;
export type Wish = typeof wishes.$inferSelect;

export type InsertTimeCapsuleMessage = z.infer<typeof insertTimeCapsuleMessageSchema>;
export type TimeCapsuleMessage = typeof timeCapsuleMessages.$inferSelect;
