import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication first
  await setupAuth(app);
  
  // For development/demo purposes - create a demo user if needed
  const isDev = app.get('env') === 'development';
  
  // Auth user endpoint
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // In development, if user isn't authenticated, return demo user
      if (isDev && (!req.isAuthenticated() || !req.user?.claims?.sub)) {
        const demoUser = await storage.getUser('demo-user-1');
        if (!demoUser) {
          // Create demo user
          await storage.upsertUser({
            id: 'demo-user-1',
            email: 'demo@example.com',
            firstName: 'Demo',
            lastName: 'User',
            profileImageUrl: null
          });
        }
        return res.json(await storage.getUser('demo-user-1'));
      }
      
      // For authenticated users
      if (req.isAuthenticated() && req.user?.claims?.sub) {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        return res.json(user);
      }
      
      // Unauthorized
      res.status(401).json({ message: "Unauthorized" });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Set up other API routes
  const { registerAllRoutes } = await import("./routes/index");
  await registerAllRoutes(app);
  
  const httpServer = createServer(app);
  return httpServer;
}
