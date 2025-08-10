import type { Express } from "express";
import { createServer, type Server } from "http";
import { registerAllRoutes } from "./routes/index";

export async function registerRoutes(app: Express): Promise<Server> {
  registerAllRoutes(app);
  
  const httpServer = createServer(app);
  return httpServer;
}
