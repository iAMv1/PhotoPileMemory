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
  name: text("name").default("anoni hea koi"),
  style: text("style").notNull(),
  topPosition: integer("top_position").notNull(),
  leftPosition: integer("left_position").notNull(),
  rotation: integer("rotation").notNull(),
  fontSize: text("font_size").notNull(),
  shape: text("shape").default("square"),
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

export const userPhotos = pgTable("user_photos", {
  id: serial("id").primaryKey(),
  src: text("src").notNull(),
  x: integer("x").notNull(),
  y: integer("y").notNull(),
  rotation: integer("rotation").notNull(),
  zIndex: integer("z_index").notNull(),
  comment: text("comment"),
  memoryClue: text("memory_clue"),
  voiceNote: text("voice_note"),
  isGlitched: boolean("is_glitched").default(true),
  contributorName: text("contributor_name"),
  riddleQuestion: text("riddle_question"),
  riddleOptions: text("riddle_options"),
  riddleAnswer: text("riddle_answer"),
  riddleType: text("riddle_type").default("text"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserPhotoSchema = createInsertSchema(userPhotos).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertWish = z.infer<typeof insertWishSchema>;
export type Wish = typeof wishes.$inferSelect;

export type InsertTimeCapsuleMessage = z.infer<typeof insertTimeCapsuleMessageSchema>;
export type TimeCapsuleMessage = typeof timeCapsuleMessages.$inferSelect;

export type InsertUserPhoto = z.infer<typeof insertUserPhotoSchema>;
export type UserPhoto = typeof userPhotos.$inferSelect;
