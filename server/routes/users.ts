import type { Express } from "express";
import { storage } from "../storage";

export function registerUserRoutes(app: Express) {
  // User endpoints
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ id: user.id, username: user.username, email: user.email, fullName: user.fullName });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user", error });
    }
  });
}