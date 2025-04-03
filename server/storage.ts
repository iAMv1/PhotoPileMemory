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
import { eq } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getWishes(): Promise<Wish[]>;
  createWish(wish: InsertWish): Promise<Wish>;
  
  getTimeCapsuleMessages(): Promise<TimeCapsuleMessage[]>;
  getTimeCapsuleMessageByHour(hour: number): Promise<TimeCapsuleMessage | undefined>;
  createTimeCapsuleMessage(message: InsertTimeCapsuleMessage): Promise<TimeCapsuleMessage>;
  
  getUserPhotos(): Promise<UserPhoto[]>;
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
  
  async getWishes(): Promise<Wish[]> {
    return await db.select().from(wishes);
  }
  
  async createWish(insertWish: InsertWish): Promise<Wish> {
    const result = await db.insert(wishes).values(insertWish).returning();
    return result[0];
  }
  
  async getTimeCapsuleMessages(): Promise<TimeCapsuleMessage[]> {
    return await db.select().from(timeCapsuleMessages);
  }
  
  async getTimeCapsuleMessageByHour(hour: number): Promise<TimeCapsuleMessage | undefined> {
    const result = await db.select().from(timeCapsuleMessages).where(eq(timeCapsuleMessages.hour, hour));
    return result.length ? result[0] : undefined;
  }
  
  async createTimeCapsuleMessage(insertMessage: InsertTimeCapsuleMessage): Promise<TimeCapsuleMessage> {
    const result = await db.insert(timeCapsuleMessages).values(insertMessage).returning();
    return result[0];
  }
  
  async getUserPhotos(): Promise<UserPhoto[]> {
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
        { hour: 8, message: "Good morning! Starting your birthday off right! 🌞" },
        { hour: 12, message: "Lunch time! Eat some cake! 🍰" },
        { hour: 15, message: "Afternoon vibe check - still awesome! 🌈" },
        { hour: 18, message: "Evening party time! 🎉" },
        { hour: 21, message: "Late night birthday energy! 🌙" }
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
