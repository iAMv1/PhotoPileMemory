import { 
  users, 
  wishes, 
  timeCapsuleMessages,
  userPhotos,
  type User, 
  type InsertUser, 
  type Wish, 
  type InsertWish, 
  type TimeCapsuleMessage, 
  type InsertTimeCapsuleMessage,
  type UserPhoto,
  type InsertUserPhoto
} from "@shared/schema";
import { db } from "./db";
import { eq, and, isNull } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  incrementViewCount(userId: number): Promise<void>;

  getWishes(userId?: number): Promise<Wish[]>;
  createWish(wish: InsertWish): Promise<Wish>;

  getTimeCapsuleMessages(userId?: number): Promise<TimeCapsuleMessage[]>;
  getTimeCapsuleMessageByHour(hour: number, userId?: number): Promise<TimeCapsuleMessage | undefined>;
  createTimeCapsuleMessage(message: InsertTimeCapsuleMessage): Promise<TimeCapsuleMessage>;

  getUserPhotos(userId?: number): Promise<UserPhoto[]>;
  createUserPhoto(photo: InsertUserPhoto): Promise<UserPhoto>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result.length ? result[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result.length ? result[0] : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result.length ? result[0] : undefined;
  }

  async incrementViewCount(userId: number): Promise<void> {
    const user = await this.getUser(userId);
    if (user) {
      await db.update(users)
        .set({ viewCount: (user.viewCount || 0) + 1 })
        .where(eq(users.id, userId));
    }
  }

  async getWishes(userId?: number): Promise<Wish[]> {
    if (userId) {
      return await db.select().from(wishes).where(eq(wishes.userId, userId));
    }
    return await db.select().from(wishes);
  }
  
  async createWish(insertWish: InsertWish): Promise<Wish> {
    const result = await db.insert(wishes).values(insertWish).returning();
    return result[0];
  }
  
  async getTimeCapsuleMessages(userId?: number): Promise<TimeCapsuleMessage[]> {
    if (userId) {
      return await db.select().from(timeCapsuleMessages).where(eq(timeCapsuleMessages.userId, userId));
    }
    return await db.select().from(timeCapsuleMessages);
  }

  async getTimeCapsuleMessageByHour(hour: number, userId?: number): Promise<TimeCapsuleMessage | undefined> {
    if (userId) {
      const result = await db.select()
        .from(timeCapsuleMessages)
        .where(and(
          eq(timeCapsuleMessages.hour, hour),
          eq(timeCapsuleMessages.userId, userId)
        ));
      if (result.length) return result[0];
    }

    // Fallback to default messages (userId = null)
    const result = await db.select()
      .from(timeCapsuleMessages)
      .where(and(
        eq(timeCapsuleMessages.hour, hour),
        isNull(timeCapsuleMessages.userId)
      ))
      .limit(1);
    return result.length ? result[0] : undefined;
  }
  
  async createTimeCapsuleMessage(insertMessage: InsertTimeCapsuleMessage): Promise<TimeCapsuleMessage> {
    const result = await db.insert(timeCapsuleMessages).values(insertMessage).returning();
    return result[0];
  }
  
  async getUserPhotos(userId?: number): Promise<UserPhoto[]> {
    if (userId) {
      return await db.select().from(userPhotos).where(eq(userPhotos.userId, userId));
    }
    return await db.select().from(userPhotos);
  }
  
  async createUserPhoto(insertPhoto: InsertUserPhoto): Promise<UserPhoto> {
    const result = await db.insert(userPhotos).values(insertPhoto).returning();
    return result[0];
  }
  
  async initializeDefaultTimeCapsuleMessages() {
    const existingMessages = await this.getTimeCapsuleMessages();
    if (existingMessages.length === 0) {
      const defaultMessages = [
        { hour: 8, message: "Congrats on waking up! That's harder at your age, isn't it? 💀" },
        { hour: 12, message: "Lunch time! Try not to choke on your cake, old timer! 🍰" },
        { hour: 15, message: "Afternoon check - still alive? Your back hurting yet? 👴" },
        { hour: 18, message: "Evening! Don't party too hard, you'll need your meds soon! 💊" },
        { hour: 20, message: "You are aging! Look at those wrinkles forming as we speak! 👵" },
        { hour: 21, message: "Nearly bedtime, grandpa! Remember when you could stay up late? 🌙" }
      ];
      
      for (const message of defaultMessages) {
        await this.createTimeCapsuleMessage(message);
      }
    }
  }
}

// Initialize the database storage
const storage = new DatabaseStorage();

// Initialize default time capsule messages
storage.initializeDefaultTimeCapsuleMessages().catch(console.error);

export { storage };
