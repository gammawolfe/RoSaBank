import {
  users,
  type User,
  type UpsertUser,
} from "@shared/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { type IStorage } from "./interfaces";
import { MemUserStorage } from "./userStorage";
import { MemMemberStorage } from "./memberStorage";
import { MemPaymentStorage } from "./paymentStorage";
import { MemActivityStorage } from "./activityStorage";
import { MemGroupStorage } from "./groupStorage";

export class MemStorage implements IStorage {
  private userStorage: MemUserStorage;
  private memberStorage: MemMemberStorage;
  private paymentStorage: MemPaymentStorage;
  private activityStorage: MemActivityStorage;
  private groupStorage: MemGroupStorage;

  constructor() {
    // Initialize storage modules with proper dependencies
    this.userStorage = new MemUserStorage();
    this.memberStorage = new MemMemberStorage(this.userStorage);
    this.activityStorage = new MemActivityStorage();
    this.paymentStorage = new MemPaymentStorage(this.userStorage, this);
    this.groupStorage = new MemGroupStorage(this.memberStorage, this.paymentStorage, this.userStorage);
  }

  // User methods
  async getUser(id: string) {
    // Try database first for Replit Auth users
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      if (user) return user;
    } catch (error) {
      console.warn("Database query failed, falling back to memory storage:", error);
    }
    return this.userStorage.getUser(id);
  }

  async getUserByUsername(username: string) {
    return this.userStorage.getUserByUsername(username);
  }

  async getUserByEmail(email: string) {
    return this.userStorage.getUserByEmail(email);
  }

  async createUser(user: Parameters<MemUserStorage['createUser']>[0]) {
    return this.userStorage.createUser(user);
  }

  // Required for Replit Auth
  async upsertUser(userData: UpsertUser): Promise<User> {
    try {
      const [user] = await db
        .insert(users)
        .values(userData)
        .onConflictDoUpdate({
          target: users.id,
          set: {
            ...userData,
            updatedAt: new Date(),
          },
        })
        .returning();
      return user;
    } catch (error) {
      console.error("Database upsert failed:", error);
      throw error;
    }
  }

  // Group methods
  async getSavingsGroup(id: string) {
    return this.groupStorage.getSavingsGroup(id);
  }

  async getUserGroups(userId: string) {
    return this.groupStorage.getUserGroups(userId);
  }

  async getAllGroups() {
    return this.groupStorage.getAllGroups();
  }

  async createSavingsGroup(group: Parameters<MemGroupStorage['createSavingsGroup']>[0]) {
    return this.groupStorage.createSavingsGroup(group);
  }

  async updateSavingsGroup(id: string, updates: Parameters<MemGroupStorage['updateSavingsGroup']>[1]) {
    return this.groupStorage.updateSavingsGroup(id, updates);
  }

  // Member methods
  async getGroupMembers(groupId: string) {
    return this.memberStorage.getGroupMembers(groupId);
  }

  async addGroupMember(member: Parameters<MemMemberStorage['addGroupMember']>[0]) {
    return this.memberStorage.addGroupMember(member);
  }

  async removeGroupMember(groupId: string, userId: string) {
    return this.memberStorage.removeGroupMember(groupId, userId);
  }

  async isUserInGroup(groupId: string, userId: string) {
    return this.memberStorage.isUserInGroup(groupId, userId);
  }

  async getUserMemberships(userId: string) {
    return this.memberStorage.getUserMemberships(userId);
  }

  // Payment methods
  async getPayment(id: string) {
    return this.paymentStorage.getPayment(id);
  }

  async getGroupPayments(groupId: string) {
    return this.paymentStorage.getGroupPayments(groupId);
  }

  async getUserPayments(userId: string) {
    return this.paymentStorage.getUserPayments(userId);
  }

  async createPayment(payment: Parameters<MemPaymentStorage['createPayment']>[0]) {
    return this.paymentStorage.createPayment(payment);
  }

  async updatePayment(id: string, updates: Parameters<MemPaymentStorage['updatePayment']>[1]) {
    return this.paymentStorage.updatePayment(id, updates);
  }

  // Activity methods
  async getUserActivities(userId: string, limit?: number) {
    return this.activityStorage.getUserActivities(userId, limit);
  }

  async createActivity(activity: Parameters<MemActivityStorage['createActivity']>[0]) {
    return this.activityStorage.createActivity(activity);
  }
}

export { type IStorage } from "./interfaces";

// Export singleton instance
export const storage = new MemStorage();