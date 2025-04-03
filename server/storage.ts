import { 
  users, 
  wishes, 
  timeCapsuleMessages, 
  type User, 
  type InsertUser, 
  type Wish, 
  type InsertWish, 
  type TimeCapsuleMessage, 
  type InsertTimeCapsuleMessage 
} from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private wishes: Map<number, Wish>;
  private timeCapsuleMessages: Map<number, TimeCapsuleMessage>;
  userCurrentId: number;
  wishCurrentId: number;
  timeCapsuleMessageCurrentId: number;

  constructor() {
    this.users = new Map();
    this.wishes = new Map();
    this.timeCapsuleMessages = new Map();
    this.userCurrentId = 1;
    this.wishCurrentId = 1;
    this.timeCapsuleMessageCurrentId = 1;
    
    // Initialize with default time capsule messages
    this.initializeDefaultTimeCapsuleMessages();
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getWishes(): Promise<Wish[]> {
    return Array.from(this.wishes.values());
  }
  
  async createWish(insertWish: InsertWish): Promise<Wish> {
    const id = this.wishCurrentId++;
    const wish: Wish = { 
      ...insertWish, 
      id, 
      createdAt: new Date() 
    };
    this.wishes.set(id, wish);
    return wish;
  }
  
  async getTimeCapsuleMessages(): Promise<TimeCapsuleMessage[]> {
    return Array.from(this.timeCapsuleMessages.values());
  }
  
  async getTimeCapsuleMessageByHour(hour: number): Promise<TimeCapsuleMessage | undefined> {
    return Array.from(this.timeCapsuleMessages.values()).find(
      (message) => message.hour === hour,
    );
  }
  
  async createTimeCapsuleMessage(insertMessage: InsertTimeCapsuleMessage): Promise<TimeCapsuleMessage> {
    const id = this.timeCapsuleMessageCurrentId++;
    const message: TimeCapsuleMessage = { ...insertMessage, id };
    this.timeCapsuleMessages.set(id, message);
    return message;
  }
  
  private async initializeDefaultTimeCapsuleMessages() {
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

export const storage = new MemStorage();
