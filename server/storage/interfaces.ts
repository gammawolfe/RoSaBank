import { type User, type InsertUser, type SavingsGroup, type InsertSavingsGroup, type GroupMember, type InsertGroupMember, type Payment, type InsertPayment, type Activity, type InsertActivity, type GroupWithMembers, type PaymentWithDetails } from "@shared/schema";

export interface IUserStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export interface IGroupStorage {
  getSavingsGroup(id: string): Promise<SavingsGroup | undefined>;
  getUserGroups(userId: string): Promise<GroupWithMembers[]>;
  getAllGroups(): Promise<SavingsGroup[]>;
  createSavingsGroup(group: InsertSavingsGroup): Promise<SavingsGroup>;
  updateSavingsGroup(id: string, updates: Partial<SavingsGroup>): Promise<SavingsGroup | undefined>;
}

export interface IMemberStorage {
  getGroupMembers(groupId: string): Promise<(GroupMember & { user: User })[]>;
  addGroupMember(member: InsertGroupMember): Promise<GroupMember>;
  removeGroupMember(groupId: string, userId: string): Promise<boolean>;
  isUserInGroup(groupId: string, userId: string): Promise<boolean>;
  getUserMemberships(userId: string): Promise<GroupMember[]>;
}

export interface IPaymentStorage {
  getPayment(id: string): Promise<Payment | undefined>;
  getGroupPayments(groupId: string): Promise<PaymentWithDetails[]>;
  getUserPayments(userId: string): Promise<PaymentWithDetails[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | undefined>;
}

export interface IActivityStorage {
  getUserActivities(userId: string, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
}

export interface IStorage extends 
  IUserStorage, 
  IGroupStorage, 
  IMemberStorage, 
  IPaymentStorage, 
  IActivityStorage {
}