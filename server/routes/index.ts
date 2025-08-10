import type { Express } from "express";
import { registerAuthRoutes } from "./auth";
import { registerUserRoutes } from "./users";
import { registerGroupRoutes } from "./groups";
import { registerPaymentRoutes } from "./payments";
import { registerActivityRoutes } from "./activities";

export function registerAllRoutes(app: Express) {
  registerAuthRoutes(app);
  registerUserRoutes(app);
  registerGroupRoutes(app);
  registerPaymentRoutes(app);
  registerActivityRoutes(app);
}