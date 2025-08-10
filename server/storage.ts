import { type User, type InsertUser, type SavingsGroup, type InsertSavingsGroup, type GroupMember, type InsertGroupMember, type Payment, type InsertPayment, type Activity, type InsertActivity, type GroupWithMembers, type PaymentWithDetails } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Group methods
  getSavingsGroup(id: string): Promise<SavingsGroup | undefined>;
  getUserGroups(userId: string): Promise<GroupWithMembers[]>;
  getAllGroups(): Promise<SavingsGroup[]>;
  createSavingsGroup(group: InsertSavingsGroup): Promise<SavingsGroup>;
  updateSavingsGroup(id: string, updates: Partial<SavingsGroup>): Promise<SavingsGroup | undefined>;
  
  // Member methods
  getGroupMembers(groupId: string): Promise<(GroupMember & { user: User })[]>;
  addGroupMember(member: InsertGroupMember): Promise<GroupMember>;
  removeGroupMember(groupId: string, userId: string): Promise<boolean>;
  isUserInGroup(groupId: string, userId: string): Promise<boolean>;
  
  // Payment methods
  getPayment(id: string): Promise<Payment | undefined>;
  getGroupPayments(groupId: string): Promise<PaymentWithDetails[]>;
  getUserPayments(userId: string): Promise<PaymentWithDetails[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | undefined>;
  
  // Activity methods
  getUserActivities(userId: string, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private savingsGroups: Map<string, SavingsGroup> = new Map();
  private groupMembers: Map<string, GroupMember> = new Map();
  private payments: Map<string, Payment> = new Map();
  private activities: Map<string, Activity> = new Map();

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

  // User methods
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

  // Group methods
  async getSavingsGroup(id: string): Promise<SavingsGroup | undefined> {
    return this.savingsGroups.get(id);
  }

  async getUserGroups(userId: string): Promise<GroupWithMembers[]> {
    const userMemberships = Array.from(this.groupMembers.values())
      .filter(member => member.userId === userId);
    
    const groups: GroupWithMembers[] = [];
    
    for (const membership of userMemberships) {
      const group = this.savingsGroups.get(membership.groupId);
      if (!group) continue;
      
      const members = await this.getGroupMembers(group.id);
      const payments = await this.getGroupPayments(group.id);
      
      const totalPaid = payments
        .filter(p => p.type === 'contribution' && p.status === 'completed')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
      const currentTurnMember = members.find(m => m.turnOrder === group.currentTurnIndex + 1)?.user;
      const nextTurnMember = members.find(m => m.turnOrder === (group.currentTurnIndex + 1) % members.length + 1)?.user;
      
      // Check user's payment status for current round
      const userPayment = payments.find(p => 
        p.fromUserId === userId && 
        p.round === group.currentRound && 
        p.type === 'contribution'
      );
      
      let userPaymentStatus: 'paid' | 'pending' | 'overdue' = 'pending';
      if (userPayment) {
        if (userPayment.status === 'completed') {
          userPaymentStatus = 'paid';
        } else if (userPayment.dueDate && new Date() > userPayment.dueDate) {
          userPaymentStatus = 'overdue';
        }
      }
      
      groups.push({
        ...group,
        members,
        memberCount: members.length,
        totalPaid,
        currentTurnMember,
        nextTurnMember,
        userMembership: membership,
        userPaymentStatus,
      });
    }
    
    return groups;
  }

  async getAllGroups(): Promise<SavingsGroup[]> {
    return Array.from(this.savingsGroups.values());
  }

  async createSavingsGroup(insertGroup: InsertSavingsGroup): Promise<SavingsGroup> {
    const id = randomUUID();
    const group: SavingsGroup = {
      ...insertGroup,
      id,
      description: insertGroup.description || null,
      currentRound: 1,
      currentTurnIndex: 0,
      isActive: true,
      createdAt: new Date(),
    };
    this.savingsGroups.set(id, group);
    
    // Add creator as first member and admin
    await this.addGroupMember({
      groupId: id,
      userId: insertGroup.createdById,
      turnOrder: 1,
      isAdmin: true,
    });
    
    return group;
  }

  async updateSavingsGroup(id: string, updates: Partial<SavingsGroup>): Promise<SavingsGroup | undefined> {
    const group = this.savingsGroups.get(id);
    if (!group) return undefined;
    
    const updatedGroup = { ...group, ...updates };
    this.savingsGroups.set(id, updatedGroup);
    return updatedGroup;
  }

  // Member methods
  async getGroupMembers(groupId: string): Promise<(GroupMember & { user: User })[]> {
    const members = Array.from(this.groupMembers.values())
      .filter(member => member.groupId === groupId)
      .sort((a, b) => a.turnOrder - b.turnOrder);
    
    return members.map(member => ({
      ...member,
      user: this.users.get(member.userId)!,
    }));
  }

  async addGroupMember(insertMember: InsertGroupMember): Promise<GroupMember> {
    const id = randomUUID();
    const member: GroupMember = {
      ...insertMember,
      id,
      isAdmin: insertMember.isAdmin || false,
      joinedAt: new Date(),
    };
    this.groupMembers.set(id, member);
    return member;
  }

  async removeGroupMember(groupId: string, userId: string): Promise<boolean> {
    const member = Array.from(this.groupMembers.values())
      .find(m => m.groupId === groupId && m.userId === userId);
    
    if (member) {
      this.groupMembers.delete(member.id);
      return true;
    }
    return false;
  }

  async isUserInGroup(groupId: string, userId: string): Promise<boolean> {
    return Array.from(this.groupMembers.values())
      .some(member => member.groupId === groupId && member.userId === userId);
  }

  // Payment methods
  async getPayment(id: string): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async getGroupPayments(groupId: string): Promise<PaymentWithDetails[]> {
    const payments = Array.from(this.payments.values())
      .filter(payment => payment.groupId === groupId);
    
    return payments.map(payment => ({
      ...payment,
      fromUser: this.users.get(payment.fromUserId)!,
      toUser: payment.toUserId ? this.users.get(payment.toUserId) : undefined,
      group: this.savingsGroups.get(payment.groupId)!,
    }));
  }

  async getUserPayments(userId: string): Promise<PaymentWithDetails[]> {
    const payments = Array.from(this.payments.values())
      .filter(payment => payment.fromUserId === userId || payment.toUserId === userId);
    
    return payments.map(payment => ({
      ...payment,
      fromUser: this.users.get(payment.fromUserId)!,
      toUser: payment.toUserId ? this.users.get(payment.toUserId) : undefined,
      group: this.savingsGroups.get(payment.groupId)!,
    }));
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = randomUUID();
    const payment: Payment = {
      ...insertPayment,
      id,
      toUserId: insertPayment.toUserId || null,
      dueDate: insertPayment.dueDate || null,
      paidAt: null,
      status: 'pending',
      createdAt: new Date(),
    };
    this.payments.set(id, payment);
    return payment;
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (!payment) return undefined;
    
    const updatedPayment = { ...payment, ...updates };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }

  // Activity methods
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

export const storage = new MemStorage();
