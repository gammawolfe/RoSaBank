import type { Express } from "express";
import { storage } from "../storage";

export function registerActivityRoutes(app: Express) {
  // Activity endpoints
  app.get("/api/activities", async (req, res) => {
    try {
      const { userId, limit } = req.query;
      if (!userId) {
        return res.status(400).json({ message: "userId required" });
      }
      
      const activities = await storage.getUserActivities(
        userId as string, 
        limit ? parseInt(limit as string) : undefined
      );
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities", error });
    }
  });
}