import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Storage class
class DatabaseStorage {
    async getEventById(id) {
        const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
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
        };
    }

    async getEventBySlug(slug) {
        const { data, error } = await supabase.from('events').select('*').eq('slug', slug).single();
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
        };
    }

    async createEvent(insertEvent) {
        const dbEvent = {
            slug: insertEvent.slug,
            owner_email: insertEvent.ownerEmail || null,
            birthday_person_name: insertEvent.birthdayPersonName,
            birthday_person_age: insertEvent.birthdayPersonAge,
            birthday_date: insertEvent.birthdayDate || null,
            theme_color: insertEvent.themeColor || '#ec4899'
        };
        const { data, error } = await supabase.from('events').insert(dbEvent).select().single();
        if (error) throw new Error(error.message);
        return {
            id: data.id,
            slug: data.slug,
            ownerEmail: data.owner_email,
            birthdayPersonName: data.birthday_person_name,
            birthdayPersonAge: data.birthday_person_age,
            birthdayDate: data.birthday_date,
            themeColor: data.theme_color,
            createdAt: data.created_at
        };
    }

    async getWishes(eventId) {
        const { data, error } = await supabase.from('wishes').select('*').eq('event_id', eventId);
        if (error) throw new Error(error.message);
        return (data || []).map((w) => ({
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
        }));
    }

    async createWish(insertWish) {
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
        const { data, error } = await supabase.from('wishes').insert(dbWish).select().single();
        if (error) throw new Error(error.message);
        return data;
    }

    async getTimeCapsuleMessages(eventId) {
        const { data, error } = await supabase.from('time_capsule_messages').select('*').eq('event_id', eventId);
        if (error) throw new Error(error.message);
        return data;
    }

    async getTimeCapsuleMessageByHour(eventId, hour) {
        const { data, error } = await supabase.from('time_capsule_messages').select('*').eq('event_id', eventId).eq('hour', hour).single();
        if (error) return undefined;
        return data;
    }

    async createTimeCapsuleMessage(insertMessage) {
        const dbMessage = {
            event_id: insertMessage.eventId || null,
            hour: insertMessage.hour,
            message: insertMessage.message,
            author_name: insertMessage.authorName || null
        };
        const { data, error } = await supabase.from('time_capsule_messages').insert(dbMessage).select().single();
        if (error) throw new Error(error.message);
        return data;
    }

    async initializeDefaultTimeCapsuleMessages(eventId) {
        // No longer initializing default messages - contributors will add their own
    }

    async getUserPhotos(eventId) {
        const { data, error } = await supabase.from('user_photos').select('*').eq('event_id', eventId);
        if (error) throw new Error(error.message);
        return (data || []).map((p) => ({
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
        }));
    }

    async createUserPhoto(insertPhoto) {
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
        const { data, error } = await supabase.from('user_photos').insert(dbPhoto).select().single();
        if (error) throw new Error(error.message);
        return data;
    }

    async getEventConfig(eventId) {
        const { data, error } = await supabase.from('event_config').select('key, value').eq('event_id', eventId);
        if (error) return [];
        return data;
    }

    async setEventConfig(eventId, key, value) {
        const existing = await this.getEventConfig(eventId);
        const exists = existing.find((e) => e.key === key);
        if (exists) {
            await supabase.from('event_config').update({ value }).eq('event_id', eventId).eq('key', key);
        } else {
            await supabase.from('event_config').insert({ event_id: eventId, key, value });
        }
    }
}

const storage = new DatabaseStorage();

// API Handler
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const url = req.url;
    const method = req.method;

    try {
        // POST /api/events
        if (url === '/api/events' && method === 'POST') {
            const eventData = req.body;
            const event = await storage.createEvent(eventData);
            // No longer initializing default time capsule messages
            await storage.setEventConfig(event.id, 'birthday_person_age', String(event.birthdayPersonAge));
            await storage.setEventConfig(event.id, 'birthday_person_name', event.birthdayPersonName);
            return res.status(201).json({ event });
        }

        // GET /api/events/:slug
        if (url.startsWith('/api/events/') && method === 'GET') {
            const slug = url.replace('/api/events/', '');
            const event = await storage.getEventBySlug(slug);
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }
            return res.json({ event });
        }

        // GET /api/wishes
        if (url.startsWith('/api/wishes') && method === 'GET') {
            const urlObj = new URL(url, `http://${req.headers.host}`);
            const eventId = urlObj.searchParams.get('eventId');
            if (!eventId) return res.status(400).json({ message: 'eventId required' });
            const wishes = await storage.getWishes(eventId);
            return res.json({ wishes });
        }

        // POST /api/wishes
        if (url === '/api/wishes' && method === 'POST') {
            const wishData = req.body;
            const wish = await storage.createWish(wishData);
            return res.status(201).json({ wish });
        }

        // GET /api/time-capsule-messages
        if (url.startsWith('/api/time-capsule-messages') && !url.includes('/current') && method === 'GET') {
            const urlObj = new URL(url, `http://${req.headers.host}`);
            const eventId = urlObj.searchParams.get('eventId');
            if (!eventId) return res.status(400).json({ message: 'eventId required' });
            const messages = await storage.getTimeCapsuleMessages(eventId);
            return res.json({ messages });
        }

        // GET /api/time-capsule-messages/current
        if (url.startsWith('/api/time-capsule-messages/current') && method === 'GET') {
            const urlObj = new URL(url, `http://${req.headers.host}`);
            const eventId = urlObj.searchParams.get('eventId');
            if (!eventId) return res.status(400).json({ message: 'eventId required' });
            const currentHour = new Date().getHours();
            const message = await storage.getTimeCapsuleMessageByHour(eventId, currentHour);
            if (message) {
                return res.json({ message });
            } else {
                const messages = await storage.getTimeCapsuleMessages(eventId);
                if (messages.length === 0) {
                    return res.json({ message: null });
                }
                let closestMessage = messages[0];
                let smallestDiff = Math.abs(currentHour - messages[0].hour);
                messages.forEach((msg) => {
                    const diff = Math.abs(currentHour - msg.hour);
                    if (diff < smallestDiff) {
                        smallestDiff = diff;
                        closestMessage = msg;
                    }
                });
                return res.json({ message: closestMessage });
            }
        }

        // POST /api/time-capsule-messages
        if (url === '/api/time-capsule-messages' && method === 'POST') {
            const messageData = req.body;
            const message = await storage.createTimeCapsuleMessage(messageData);
            return res.status(201).json({ message });
        }

        // GET /api/user-photos
        if (url.startsWith('/api/user-photos') && method === 'GET') {
            const urlObj = new URL(url, `http://${req.headers.host}`);
            const eventId = urlObj.searchParams.get('eventId');
            if (!eventId) return res.status(400).json({ message: 'eventId required' });
            const photos = await storage.getUserPhotos(eventId);
            return res.json({ photos });
        }

        // POST /api/user-photos
        if (url === '/api/user-photos' && method === 'POST') {
            const photoData = req.body;
            const photo = await storage.createUserPhoto(photoData);
            return res.status(201).json({ photo });
        }

        // GET /api/event-config
        if (url.startsWith('/api/event-config') && method === 'GET') {
            const urlObj = new URL(url, `http://${req.headers.host}`);
            const eventId = urlObj.searchParams.get('eventId');
            if (!eventId) return res.status(400).json({ message: 'eventId required' });
            const config = await storage.getEventConfig(eventId);
            return res.json({ config });
        }

        // POST /api/event-config
        if (url === '/api/event-config' && method === 'POST') {
            const { eventId, key, value } = req.body;
            if (!eventId || !key || value === undefined) {
                return res.status(400).json({ message: 'eventId, key and value required' });
            }
            await storage.setEventConfig(eventId, key, value);
            return res.json({ success: true });
        }

        // POST /api/verify-age
        if (url === '/api/verify-age' && method === 'POST') {
            const { age, eventId } = req.body;
            if (!eventId) return res.status(400).json({ message: 'eventId required' });
            const event = await storage.getEventById(eventId);
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }
            const correctAge = event.birthdayPersonAge;
            if (String(age) === String(correctAge)) {
                return res.json({ success: true, verified: true });
            } else {
                return res.json({ success: true, verified: false });
            }
        }

        // 404 for unhandled routes
        return res.status(404).json({ message: 'API route not found' });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
}
