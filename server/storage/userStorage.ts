import { type User, type InsertUser } from "@shared/schema";
import { type IUserStorage } from "./interfaces";
import { randomUUID } from "crypto";

export class MemUserStorage implements IUserStorage {
  private users: Map<string, User> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create a demo user
    const demoUser: User = {
      id: 'demo-user-1',
      username: 'demo',
      email: 'demo@example.com',
      fullName: 'Demo User',
      password: 'password',
      createdAt: new Date(),
    };
    this.users.set(demoUser.id, demoUser);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }
}