import { type Activity, type InsertActivity } from "@shared/schema";
import { type IActivityStorage } from "./interfaces";
import { randomUUID } from "crypto";

export class MemActivityStorage implements IActivityStorage {
  private activities: Map<string, Activity> = new Map();

  async getUserActivities(userId: string, limit = 10): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())
      .slice(0, limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = randomUUID();
    const activity: Activity = {
      ...insertActivity,
      id,
      description: insertActivity.description || null,
      groupId: insertActivity.groupId || null,
      createdAt: new Date(),
    };
    this.activities.set(id, activity);
    return activity;
  }
}