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
  type InsertUserPhoto,
  type Event,
  type InsertEvent,
  type EventConfig,
  type InsertEventConfig
} from "@shared/schema";
import { supabase } from "./db";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getWishes(eventId: string): Promise<Wish[]>;
  createWish(wish: InsertWish): Promise<Wish>;

  getTimeCapsuleMessages(eventId: string): Promise<TimeCapsuleMessage[]>;
  getTimeCapsuleMessageByHour(eventId: string, hour: number): Promise<TimeCapsuleMessage | undefined>;
  createTimeCapsuleMessage(message: InsertTimeCapsuleMessage): Promise<TimeCapsuleMessage>;

  getUserPhotos(eventId: string): Promise<UserPhoto[]>;
  createUserPhoto(photo: InsertUserPhoto): Promise<UserPhoto>;

  getEventConfig(eventId: string): Promise<{ key: string; value: string }[]>;
  setEventConfig(eventId: string, key: string, value: string): Promise<void>;

  createEvent(event: InsertEvent): Promise<Event>;
  getEventBySlug(slug: string): Promise<Event | undefined>;
  getEventById(id: string): Promise<Event | undefined>;
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

  async getWishes(eventId: string): Promise<Wish[]> {
    const { data, error } = await supabase
      .from('wishes')
      .select('*')
      .eq('event_id', eventId);

    if (error) throw new Error(error.message);

    // Transform snake_case to camelCase
    return (data || []).map((w: any) => ({
      id: w.id,
      eventId: w.event_id,
      text: w.text,
      name: w.name,
      style: w.style,
      topPosition: w.top_position,
      leftPosition: w.left_position,
      rotation: w.rotation,
      fontSize: w.font_size,
      shape: w.shape,
      createdAt: w.created_at
    })) as Wish[];
  }

  async createWish(insertWish: InsertWish): Promise<Wish> {
    // Convert camelCase to snake_case for Supabase
    const dbWish = {
      event_id: insertWish.eventId || null,
      text: insertWish.text,
      name: insertWish.name || 'anoni hea koi',
      style: insertWish.style,
      top_position: insertWish.topPosition,
      left_position: insertWish.leftPosition,
      rotation: insertWish.rotation,
      font_size: insertWish.fontSize,
      shape: insertWish.shape || 'square'
    };

    const { data, error } = await supabase
      .from('wishes')
      .insert(dbWish)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Wish;
  }

  async getTimeCapsuleMessages(eventId: string): Promise<TimeCapsuleMessage[]> {
    const { data, error } = await supabase
      .from('time_capsule_messages')
      .select('*')
      .eq('event_id', eventId);

    if (error) throw new Error(error.message);
    return data as TimeCapsuleMessage[];
  }

  async getTimeCapsuleMessageByHour(eventId: string, hour: number): Promise<TimeCapsuleMessage | undefined> {
    const { data, error } = await supabase
      .from('time_capsule_messages')
      .select('*')
      .eq('event_id', eventId)
      .eq('hour', hour)
      .single();

    if (error) return undefined;
    return data as TimeCapsuleMessage;
  }

  async createTimeCapsuleMessage(insertMessage: InsertTimeCapsuleMessage): Promise<TimeCapsuleMessage> {
    // Convert camelCase to snake_case for Supabase
    const dbMessage = {
      event_id: insertMessage.eventId || null,
      hour: insertMessage.hour,
      message: insertMessage.message,
      author_name: insertMessage.authorName || null
    };

    const { data, error } = await supabase
      .from('time_capsule_messages')
      .insert(dbMessage)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as TimeCapsuleMessage;
  }

  async getUserPhotos(eventId: string): Promise<UserPhoto[]> {
    const { data, error } = await supabase
      .from('user_photos')
      .select('*')
      .eq('event_id', eventId);

    if (error) throw new Error(error.message);

    // Transform snake_case response to camelCase
    return (data || []).map((p: any) => ({
      id: p.id,
      eventId: p.event_id,
      src: p.src,
      x: p.x,
      y: p.y,
      rotation: p.rotation,
      zIndex: p.z_index,
      comment: p.comment,
      memoryClue: p.memory_clue,
      voiceNote: p.voice_note,
      isGlitched: p.is_glitched,
      contributorName: p.contributor_name,
      riddleQuestion: p.riddle_question,
      riddleOptions: p.riddle_options,
      riddleAnswer: p.riddle_answer,
      riddleType: p.riddle_type,
      createdAt: p.created_at
    })) as UserPhoto[];
  }

  async createUserPhoto(insertPhoto: InsertUserPhoto): Promise<UserPhoto> {
    // Convert camelCase to snake_case for Supabase
    const dbPhoto = {
      event_id: insertPhoto.eventId || null,
      src: insertPhoto.src,
      x: insertPhoto.x,
      y: insertPhoto.y,
      rotation: insertPhoto.rotation,
      z_index: insertPhoto.zIndex,
      comment: insertPhoto.comment || null,
      memory_clue: insertPhoto.memoryClue || null,
      voice_note: insertPhoto.voiceNote || null,
      is_glitched: insertPhoto.isGlitched ?? true,
      contributor_name: insertPhoto.contributorName || null,
      riddle_question: insertPhoto.riddleQuestion || null,
      riddle_options: insertPhoto.riddleOptions || null,
      riddle_answer: insertPhoto.riddleAnswer || null,
      riddle_type: insertPhoto.riddleType || null
    };

    const { data, error } = await supabase
      .from('user_photos')
      .insert(dbPhoto)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as UserPhoto;
  }

  async initializeDefaultTimeCapsuleMessages(eventId: string) {
    // No longer initializing default messages - contributors will add their own
    // This function is kept for backwards compatibility but does nothing
  }

  async getEventConfig(eventId: string): Promise<{ key: string; value: string }[]> {
    const { data, error } = await supabase
      .from('event_config')
      .select('key, value')
      .eq('event_id', eventId);

    if (error) return [];
    return data as { key: string; value: string }[];
  }

  async setEventConfig(eventId: string, key: string, value: string): Promise<void> {
    // Check if config exists for this event
    const existing = await this.getEventConfig(eventId);
    const exists = existing.find(e => e.key === key);

    if (exists) {
      await supabase
        .from('event_config')
        .update({ value })
        .eq('event_id', eventId)
        .eq('key', key);
    } else {
      await supabase
        .from('event_config')
        .insert({ event_id: eventId, key, value });
    }
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    // Convert camelCase to snake_case for Supabase
    const dbEvent = {
      slug: insertEvent.slug,
      owner_email: insertEvent.ownerEmail || null,
      birthday_person_name: insertEvent.birthdayPersonName,
      birthday_person_age: insertEvent.birthdayPersonAge,
      birthday_date: insertEvent.birthdayDate || null,
      theme_color: insertEvent.themeColor || '#ec4899'
    };

    const { data, error } = await supabase
      .from('events')
      .insert(dbEvent)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Transform response back to camelCase
    return {
      id: data.id,
      slug: data.slug,
      ownerEmail: data.owner_email,
      birthdayPersonName: data.birthday_person_name,
      birthdayPersonAge: data.birthday_person_age,
      birthdayDate: data.birthday_date,
      themeColor: data.theme_color,
      createdAt: data.created_at
    } as Event;
  }

  async getEventBySlug(slug: string): Promise<Event | undefined> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) return undefined;

    return {
      id: data.id,
      slug: data.slug,
      ownerEmail: data.owner_email,
      birthdayPersonName: data.birthday_person_name,
      birthdayPersonAge: data.birthday_person_age,
      birthdayDate: data.birthday_date,
      themeColor: data.theme_color,
      createdAt: data.created_at
    } as Event;
  }

  async getEventById(id: string): Promise<Event | undefined> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return undefined;

    return {
      id: data.id,
      slug: data.slug,
      ownerEmail: data.owner_email,
      birthdayPersonName: data.birthday_person_name,
      birthdayPersonAge: data.birthday_person_age,
      birthdayDate: data.birthday_date,
      themeColor: data.theme_color,
      createdAt: data.created_at
    } as Event;
  }
}

// Initialize the database storage
const storage = new DatabaseStorage();

// Initialize default time capsule messages
// Initialize default time capsule messages - REMOVED AUTO INIT as it needs eventId now
// storage.initializeDefaultTimeCapsuleMessages().catch(console.error);

export { storage };
