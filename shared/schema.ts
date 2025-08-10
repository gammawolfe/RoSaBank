import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  password: text("password").notNull(),
  personalWalletId: varchar("personal_wallet_id"), // Reference to user's personal wallet
  createdAt: timestamp("created_at").defaultNow(),
});

export const savingsGroups = pgTable("savings_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  contributionAmount: decimal("contribution_amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default('USD'),
  frequency: text("frequency").notNull(), // 'monthly', 'weekly', 'bi-weekly'
  maxMembers: integer("max_members").notNull(),
  currentRound: integer("current_round").notNull().default(1),
  currentTurnIndex: integer("current_turn_index").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  walletId: varchar("wallet_id"), // Reference to App A's wallet
  createdById: varchar("created_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const groupMembers = pgTable("group_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => savingsGroups.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  turnOrder: integer("turn_order").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => savingsGroups.id, { onDelete: "cascade" }),
  fromUserId: varchar("from_user_id").notNull().references(() => users.id),
  toUserId: varchar("to_user_id").references(() => users.id), // null for regular contributions
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(), // 'contribution', 'payout'
  status: text("status").notNull().default('pending'), // 'pending', 'completed', 'failed'
  round: integer("round").notNull(),
  dueDate: timestamp("due_date"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  groupId: varchar("group_id").references(() => savingsGroups.id),
  type: text("type").notNull(), // 'payment_received', 'payment_made', 'turn_next', 'member_joined', etc.
  title: text("title").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  fullName: true,
  password: true,
});

export const insertSavingsGroupSchema = createInsertSchema(savingsGroups).pick({
  name: true,
  description: true,
  contributionAmount: true,
  currency: true,
  frequency: true,
  maxMembers: true,
  createdById: true,
});

export const insertGroupMemberSchema = createInsertSchema(groupMembers).pick({
  groupId: true,
  userId: true,
  turnOrder: true,
  isAdmin: true,
});

export const insertPaymentSchema = createInsertSchema(payments).pick({
  groupId: true,
  fromUserId: true,
  toUserId: true,
  amount: true,
  type: true,
  round: true,
  dueDate: true,
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  userId: true,
  groupId: true,
  type: true,
  title: true,
  description: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSavingsGroup = z.infer<typeof insertSavingsGroupSchema>;
export type SavingsGroup = typeof savingsGroups.$inferSelect;

export type InsertGroupMember = z.infer<typeof insertGroupMemberSchema>;
export type GroupMember = typeof groupMembers.$inferSelect;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

// Extended types for frontend
export type GroupWithMembers = SavingsGroup & {
  members: (GroupMember & { user: User })[];
  memberCount: number;
  totalPaid: number;
  currentTurnMember?: User;
  nextTurnMember?: User;
  userMembership?: GroupMember;
  userPaymentStatus?: 'paid' | 'pending' | 'overdue';
};

export type PaymentWithDetails = Payment & {
  fromUser: User;
  toUser?: User;
  group: SavingsGroup;
};
