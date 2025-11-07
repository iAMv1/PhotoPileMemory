import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertWishSchema,
  insertTimeCapsuleMessageSchema,
  insertUserPhotoSchema,
  registerUserSchema,
  loginUserSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import bcrypt from "bcryptjs";
import passport from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = express.Router();

  // Authentication routes

  // Register a new user
  apiRouter.post("/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = registerUserSchema.parse(req.body);

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user
      const user = await storage.createUser({
        username: userData.username,
        password: hashedPassword,
        displayName: userData.displayName || userData.username,
        birthday: userData.birthday ? new Date(userData.birthday) : undefined,
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      // Auto-login after registration
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Registration successful but login failed" });
        }
        res.status(201).json({ user: userWithoutPassword });
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Failed to register user" });
      }
    }
  });

  // Login
  apiRouter.post("/auth/login", (req: Request, res: Response, next) => {
    try {
      loginUserSchema.parse(req.body);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
    }

    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Authentication error" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed" });
        }

        const { password: _, ...userWithoutPassword } = user;
        res.json({ user: userWithoutPassword });
      });
    })(req, res, next);
  });

  // Logout
  apiRouter.post("/auth/logout", (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  apiRouter.get("/auth/me", (req: Request, res: Response) => {
    if (req.isAuthenticated() && req.user) {
      const { password: _, ...userWithoutPassword } = req.user as any;
      res.json({ user: userWithoutPassword });
    } else {
      res.json({ user: null });
    }
  });

  // Get user profile by username (public route)
  apiRouter.get("/users/:username", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername(req.params.username);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Increment view count
      await storage.incrementViewCount(user.id);

      // Remove sensitive data
      const { password: _, pagePassword: __, ...publicUser } = user;
      res.json({ user: publicUser });
    } catch (error) {
      console.error("Error getting user profile:", error);
      res.status(500).json({ message: "Failed to get user profile" });
    }
  });

  // Update user profile
  apiRouter.patch("/users/:username", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUserByUsername(req.params.username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if the authenticated user is updating their own profile
      if ((req.user as any).id !== user.id) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const updates = req.body;

      // If updating password, hash it
      if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
      }

      const updatedUser = await storage.updateUser(user.id, updates);

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  // Get all wishes (with optional userId filter)
  apiRouter.get("/wishes", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const wishes = await storage.getWishes(userId);
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
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const messages = await storage.getTimeCapsuleMessages(userId);
      res.json({ messages });
    } catch (error) {
      console.error("Error getting time capsule messages:", error);
      res.status(500).json({ message: "Failed to get time capsule messages" });
    }
  });

  // Get time capsule message by hour
  apiRouter.get("/time-capsule-messages/current", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const currentHour = new Date().getHours();
      const message = await storage.getTimeCapsuleMessageByHour(currentHour, userId);

      if (message) {
        res.json({ message });
      } else {
        // Find nearest message if exact hour doesn't exist
        const messages = await storage.getTimeCapsuleMessages(userId);
        if (messages.length === 0) {
          return res.status(404).json({ message: "No time capsule messages found" });
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
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const photos = await storage.getUserPhotos(userId);
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
  
  // Register all API routes with /api prefix
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
