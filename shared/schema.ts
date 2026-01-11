import { pgTable, text, serial, integer, boolean, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Events table - each birthday event has its own isolated data
export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  ownerEmail: text("owner_email"),
  birthdayPersonName: text("birthday_person_name").notNull(),
  birthdayPersonAge: integer("birthday_person_age").notNull(),
  birthdayDate: text("birthday_date"), // Format: YYYY-MM-DD
  themeColor: text("theme_color").default("#ec4899"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

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
  eventId: uuid("event_id").references(() => events.id),
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
  eventId: uuid("event_id").references(() => events.id),
  hour: integer("hour").notNull(),
  message: text("message").notNull(),
  authorName: text("author_name"),
});

export const insertTimeCapsuleMessageSchema = createInsertSchema(timeCapsuleMessages).omit({
  id: true,
});

export const userPhotos = pgTable("user_photos", {
  id: serial("id").primaryKey(),
  eventId: uuid("event_id").references(() => events.id),
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

export const eventConfig = pgTable("event_config", {
  id: serial("id").primaryKey(),
  eventId: uuid("event_id").references(() => events.id),
  key: text("key").notNull(),
  value: text("value").notNull(),
});

export const insertEventConfigSchema = createInsertSchema(eventConfig).omit({
  id: true,
});

// Type exports
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertWish = z.infer<typeof insertWishSchema>;
export type Wish = typeof wishes.$inferSelect;

export type InsertTimeCapsuleMessage = z.infer<typeof insertTimeCapsuleMessageSchema>;
export type TimeCapsuleMessage = typeof timeCapsuleMessages.$inferSelect;

export type InsertUserPhoto = z.infer<typeof insertUserPhotoSchema>;
export type UserPhoto = typeof userPhotos.$inferSelect;

export type InsertEventConfig = z.infer<typeof insertEventConfigSchema>;
export type EventConfig = typeof eventConfig.$inferSelect;

