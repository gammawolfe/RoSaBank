import type { Express } from "express";
import { setupAuth, isAuthenticated } from "../replitAuth";
import { storage } from "../storage";
import { registerAuthRoutes } from "./auth";
import { registerUserRoutes } from "./users";
import { registerGroupRoutes } from "./groups";
import { registerPaymentRoutes } from "./payments";
import { registerActivityRoutes } from "./activities";
import walletRoutes from "./walletRoutes";

export async function registerAllRoutes(app: Express) {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  registerAuthRoutes(app);
  registerUserRoutes(app);
  registerGroupRoutes(app);
  registerPaymentRoutes(app);
  registerActivityRoutes(app);
  app.use("/api/wallet", walletRoutes);
}