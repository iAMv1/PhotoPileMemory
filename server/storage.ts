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
import { supabase } from "./db";

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

  getEventConfig(): Promise<{ key: string; value: string }[]>;
  setEventConfig(key: string, value: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return undefined;
    return data as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error) return undefined;
    return data as User;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(insertUser)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as User;
  }

  async getWishes(): Promise<Wish[]> {
    const { data, error } = await supabase
      .from('wishes')
      .select('*');

    if (error) throw new Error(error.message);
    return data as Wish[];
  }

  async createWish(insertWish: InsertWish): Promise<Wish> {
    const { data, error } = await supabase
      .from('wishes')
      .insert(insertWish)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Wish[];
  }

  async getTimeCapsuleMessages(): Promise<TimeCapsuleMessage[]> {
    const { data, error } = await supabase
      .from('time_capsule_messages')
      .select('*');

    if (error) throw new Error(error.message);
    return data as TimeCapsuleMessage[];
  }

  async getTimeCapsuleMessageByHour(hour: number): Promise<TimeCapsuleMessage | undefined> {
    const { data, error } = await supabase
      .from('time_capsule_messages')
      .select('*')
      .eq('hour', hour)
      .single();

    if (error) return undefined;
    return data as TimeCapsuleMessage;
  }

  async createTimeCapsuleMessage(insertMessage: InsertTimeCapsuleMessage): Promise<TimeCapsuleMessage> {
    const { data, error } = await supabase
      .from('time_capsule_messages')
      .insert(insertMessage)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as TimeCapsuleMessage;
  }

  async getUserPhotos(): Promise<UserPhoto[]> {
    const { data, error } = await supabase
      .from('user_photos')
      .select('*');

    if (error) throw new Error(error.message);
    return data as UserPhoto[];
  }

  async createUserPhoto(insertPhoto: InsertUserPhoto): Promise<UserPhoto> {
    const { data, error } = await supabase
      .from('user_photos')
      .insert(insertPhoto)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as UserPhoto;
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

  async getEventConfig(): Promise<{ key: string; value: string }[]> {
    const { data, error } = await supabase
      .from('event_config')
      .select('key, value');

    if (error) return [];
    return data as { key: string; value: string }[];
  }

  async setEventConfig(key: string, value: string): Promise<void> {
    const { error } = await supabase
      .from('event_config')
      .upsert({ key, value }, { onConflict: 'key' });

    if (error) throw new Error(error.message);
  }
}

// Initialize the database storage
const storage = new DatabaseStorage();

// Initialize default time capsule messages
storage.initializeDefaultTimeCapsuleMessages().catch(console.error);

export { storage };
