import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWishSchema, insertTimeCapsuleMessageSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = express.Router();
  
  // Get all wishes
  apiRouter.get("/wishes", async (req: Request, res: Response) => {
    try {
      const wishes = await storage.getWishes();
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
      const messages = await storage.getTimeCapsuleMessages();
      res.json({ messages });
    } catch (error) {
      console.error("Error getting time capsule messages:", error);
      res.status(500).json({ message: "Failed to get time capsule messages" });
    }
  });
  
  // Get time capsule message by hour
  apiRouter.get("/time-capsule-messages/current", async (req: Request, res: Response) => {
    try {
      const currentHour = new Date().getHours();
      const message = await storage.getTimeCapsuleMessageByHour(currentHour);
      
      if (message) {
        res.json({ message });
      } else {
        // Find nearest message if exact hour doesn't exist
        const messages = await storage.getTimeCapsuleMessages();
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
  
  // Register all API routes with /api prefix
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
