import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  birthday: timestamp("birthday"),
  bio: text("bio"),
  themeColor: text("theme_color").default("#3B82F6"),
  isPrivate: boolean("is_private").default(false),
  pagePassword: text("page_password"),
  customMessage: text("custom_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  viewCount: integer("view_count").default(0),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  viewCount: true,
});

export const loginUserSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
});

export const registerUserSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  displayName: z.string().optional(),
  birthday: z.string().optional(),
});

export const wishes = pgTable("wishes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
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
  userId: integer("user_id").references(() => users.id),
  hour: integer("hour").notNull(),
  message: text("message").notNull(),
});

export const insertTimeCapsuleMessageSchema = createInsertSchema(timeCapsuleMessages).omit({
  id: true,
});

export const userPhotos = pgTable("user_photos", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  src: text("src").notNull(),
  x: integer("x").notNull(),
  y: integer("y").notNull(),
  rotation: integer("rotation").notNull(),
  zIndex: integer("z_index").notNull(),
  comment: text("comment"),
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
