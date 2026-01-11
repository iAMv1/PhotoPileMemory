import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWishSchema, insertTimeCapsuleMessageSchema, insertUserPhotoSchema, insertEventSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = express.Router();

  // --- EVENT MANAGEMENT ---

  // Create new event
  apiRouter.post("/events", async (req: Request, res: Response) => {
    try {
      console.log("Creating event with data:", JSON.stringify(req.body, null, 2));
      const eventData = insertEventSchema.parse(req.body);
      console.log("Parsed event data:", JSON.stringify(eventData, null, 2));

      const event = await storage.createEvent(eventData);
      console.log("Event created:", JSON.stringify(event, null, 2));

      // Initialize default messages for this event
      await storage.initializeDefaultTimeCapsuleMessages(event.id);
      console.log("Default messages initialized");

      // Initialize default config (age)
      await storage.setEventConfig(event.id, "birthday_person_age", String(event.birthdayPersonAge));
      await storage.setEventConfig(event.id, "birthday_person_name", event.birthdayPersonName);
      console.log("Event config set");

      res.status(201).json({ event });
    } catch (error: any) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        console.error("Zod validation error:", validationError.message);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error creating event - Full error:", error);
        console.error("Error message:", error?.message);
        console.error("Error details:", error?.details);
        console.error("Error code:", error?.code);
        res.status(500).json({ message: error?.message || "Failed to create event" });
      }
    }
  });

  // Get event by Slug
  apiRouter.get("/events/:slug", async (req: Request, res: Response) => {
    try {
      const event = await storage.getEventBySlug(req.params.slug);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json({ event });
    } catch (error) {
      console.error("Error getting event:", error);
      res.status(500).json({ message: "Failed to get event" });
    }
  });

  // --- EVENT RESOURCES (REQUIRE ?eventId=...) ---

  // Get all wishes for an event
  apiRouter.get("/wishes", async (req: Request, res: Response) => {
    try {
      const eventId = req.query.eventId as string;
      if (!eventId) return res.status(400).json({ message: "eventId required" });

      const wishes = await storage.getWishes(eventId);
      res.json({ wishes });
    } catch (error) {
      console.error("Error getting wishes:", error);
      res.status(500).json({ message: "Failed to get wishes" });
    }
  });

  // Create a new wish
  apiRouter.post("/wishes", async (req: Request, res: Response) => {
    try {
      const wishData = insertWishSchema.parse(req.body);
      // Ensure eventId is valid?? Zod checks if it's a UUID string
      const wish = await storage.createWish(wishData);
      res.status(201).json({ wish });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error creating wish:", error);
        res.status(500).json({ message: "Failed to create wish" });
      }
    }
  });

  // Get time capsule messages
  apiRouter.get("/time-capsule-messages", async (req: Request, res: Response) => {
    try {
      const eventId = req.query.eventId as string;
      if (!eventId) return res.status(400).json({ message: "eventId required" });

      const messages = await storage.getTimeCapsuleMessages(eventId);
      res.json({ messages });
    } catch (error) {
      console.error("Error getting time capsule messages:", error);
      res.status(500).json({ message: "Failed to get time capsule messages" });
    }
  });

  // Get time capsule message by hour
  apiRouter.get("/time-capsule-messages/current", async (req: Request, res: Response) => {
    try {
      const eventId = req.query.eventId as string;
      if (!eventId) return res.status(400).json({ message: "eventId required" });

      const currentHour = new Date().getHours();
      const message = await storage.getTimeCapsuleMessageByHour(eventId, currentHour);

      if (message) {
        res.json({ message });
      } else {
        // Find nearest message if exact hour doesn't exist
        const messages = await storage.getTimeCapsuleMessages(eventId);
        if (messages.length === 0) {
          return res.json({ message: null });
        }

        let closestMessage = messages[0];
        let smallestDiff = Math.abs(currentHour - messages[0].hour);

        messages.forEach(msg => {
          const diff = Math.abs(currentHour - msg.hour);
          if (diff < smallestDiff) {
            smallestDiff = diff;
            closestMessage = msg;
          }
        });

        res.json({ message: closestMessage });
      }
    } catch (error) {
      console.error("Error getting current time capsule message:", error);
      res.status(500).json({ message: "Failed to get current time capsule message" });
    }
  });

  // Create a new time capsule message
  apiRouter.post("/time-capsule-messages", async (req: Request, res: Response) => {
    try {
      const messageData = insertTimeCapsuleMessageSchema.parse(req.body);
      const message = await storage.createTimeCapsuleMessage(messageData);
      res.status(201).json({ message });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error creating time capsule message:", error);
        res.status(500).json({ message: "Failed to create time capsule message" });
      }
    }
  });

  // Get all user photos
  apiRouter.get("/user-photos", async (req: Request, res: Response) => {
    try {
      const eventId = req.query.eventId as string;
      if (!eventId) return res.status(400).json({ message: "eventId required" });

      const photos = await storage.getUserPhotos(eventId);
      res.json({ photos });
    } catch (error) {
      console.error("Error getting user photos:", error);
      res.status(500).json({ message: "Failed to get user photos" });
    }
  });

  // Create a new user photo
  apiRouter.post("/user-photos", async (req: Request, res: Response) => {
    try {
      const photoData = insertUserPhotoSchema.parse(req.body);
      const photo = await storage.createUserPhoto(photoData);
      res.status(201).json({ photo });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error creating user photo:", error);
        res.status(500).json({ message: "Failed to create user photo" });
      }
    }
  });

  // Get event config
  apiRouter.get("/event-config", async (req: Request, res: Response) => {
    try {
      const eventId = req.query.eventId as string;
      if (!eventId) return res.status(400).json({ message: "eventId required" });

      const config = await storage.getEventConfig(eventId);
      res.json({ config });
    } catch (error) {
      console.error("Error getting event config:", error);
      res.status(500).json({ message: "Failed to get event config" });
    }
  });

  // Update event config
  apiRouter.post("/event-config", async (req: Request, res: Response) => {
    try {
      const { eventId, key, value } = req.body;
      if (!eventId || !key || value === undefined) {
        return res.status(400).json({ message: "eventId, key and value required" });
      }
      await storage.setEventConfig(eventId, key, value);
      res.json({ success: true });
    } catch (error) {
      console.error("Error setting event config:", error);
      res.status(500).json({ message: "Failed to set event config" });
    }
  });

  // Verify age
  apiRouter.post("/verify-age", async (req: Request, res: Response) => {
    try {
      const { age, eventId } = req.body;
      console.log("Verify age request:", { age, eventId });

      if (!eventId) return res.status(400).json({ message: "eventId required" });

      // Get event directly to verify age (more reliable than event_config)
      const event = await storage.getEventById(eventId);
      console.log("Event found:", event ? { id: event.id, age: event.birthdayPersonAge } : "NOT FOUND");

      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const correctAge = event.birthdayPersonAge;
      console.log("Comparing:", { entered: age, correct: correctAge });

      if (String(age) === String(correctAge)) {
        res.json({ success: true, verified: true });
      } else {
        res.json({ success: true, verified: false });
      }
    } catch (error) {
      console.error("Error verifying age:", error);
      res.status(500).json({ message: "Failed to verify age" });
    }
  });

  // Register all API routes with /api prefix
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}


