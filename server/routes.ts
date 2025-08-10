import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertSavingsGroupSchema, insertGroupMemberSchema, insertPaymentSchema, insertActivitySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth endpoints
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username) || 
                          await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      const user = await storage.createUser(userData);
      res.json({ user: { id: user.id, username: user.username, email: user.email, fullName: user.fullName } });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      res.json({ user: { id: user.id, username: user.username, email: user.email, fullName: user.fullName } });
    } catch (error) {
      res.status(500).json({ message: "Login failed", error });
    }
  });

  // User endpoints
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ id: user.id, username: user.username, email: user.email, fullName: user.fullName });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user", error });
    }
  });

  // Group endpoints
  app.get("/api/groups", async (req, res) => {
    try {
      const { userId } = req.query;
      if (userId) {
        const groups = await storage.getUserGroups(userId as string);
        res.json(groups);
      } else {
        const groups = await storage.getAllGroups();
        res.json(groups);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch groups", error });
    }
  });

  app.get("/api/groups/:id", async (req, res) => {
    try {
      const group = await storage.getSavingsGroup(req.params.id);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      const members = await storage.getGroupMembers(group.id);
      const payments = await storage.getGroupPayments(group.id);
      
      const totalPaid = payments
        .filter(p => p.type === 'contribution' && p.status === 'completed')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
      const currentTurnMember = members.find(m => m.turnOrder === group.currentTurnIndex + 1)?.user;
      const nextTurnMember = members.find(m => m.turnOrder === (group.currentTurnIndex + 1) % members.length + 1)?.user;
      
      const groupWithDetails = {
        ...group,
        members,
        memberCount: members.length,
        totalPaid,
        currentTurnMember,
        nextTurnMember,
      };
      
      res.json(groupWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch group", error });
    }
  });

  app.post("/api/groups", async (req, res) => {
    try {
      const groupData = insertSavingsGroupSchema.parse(req.body);
      const group = await storage.createSavingsGroup(groupData);
      
      // Create activity
      await storage.createActivity({
        userId: groupData.createdById,
        groupId: group.id,
        type: 'group_created',
        title: 'Group created',
        description: `Created group "${group.name}"`,
      });
      
      res.json(group);
    } catch (error) {
      res.status(400).json({ message: "Invalid group data", error });
    }
  });

  app.post("/api/groups/:id/join", async (req, res) => {
    try {
      const { userId } = req.body;
      const groupId = req.params.id;
      
      // Check if user is already in group
      const alreadyMember = await storage.isUserInGroup(groupId, userId);
      if (alreadyMember) {
        return res.status(400).json({ message: "User is already a member" });
      }
      
      const group = await storage.getSavingsGroup(groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      const members = await storage.getGroupMembers(groupId);
      if (members.length >= group.maxMembers) {
        return res.status(400).json({ message: "Group is full" });
      }
      
      const newMember = await storage.addGroupMember({
        groupId,
        userId,
        turnOrder: members.length + 1,
        isAdmin: false,
      });
      
      // Create activity
      const user = await storage.getUser(userId);
      await storage.createActivity({
        userId,
        groupId,
        type: 'member_joined',
        title: 'Joined group',
        description: `${user?.fullName} joined "${group.name}"`,
      });
      
      res.json(newMember);
    } catch (error) {
      res.status(500).json({ message: "Failed to join group", error });
    }
  });

  // Payment endpoints
  app.get("/api/payments", async (req, res) => {
    try {
      const { userId, groupId } = req.query;
      
      if (userId) {
        const payments = await storage.getUserPayments(userId as string);
        res.json(payments);
      } else if (groupId) {
        const payments = await storage.getGroupPayments(groupId as string);
        res.json(payments);
      } else {
        res.status(400).json({ message: "userId or groupId required" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments", error });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(paymentData);
      
      // Create activity
      const user = await storage.getUser(paymentData.fromUserId);
      const group = await storage.getSavingsGroup(paymentData.groupId);
      
      await storage.createActivity({
        userId: paymentData.fromUserId,
        groupId: paymentData.groupId,
        type: 'payment_made',
        title: 'Payment made',
        description: `Made payment of $${paymentData.amount} to "${group?.name}"`,
      });
      
      res.json(payment);
    } catch (error) {
      res.status(400).json({ message: "Invalid payment data", error });
    }
  });

  app.patch("/api/payments/:id", async (req, res) => {
    try {
      const { status, paidAt } = req.body;
      const payment = await storage.updatePayment(req.params.id, {
        status,
        paidAt: paidAt ? new Date(paidAt) : undefined,
      });
      
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      // If payment completed, create activity
      if (status === 'completed') {
        const user = await storage.getUser(payment.fromUserId);
        const group = await storage.getSavingsGroup(payment.groupId);
        
        await storage.createActivity({
          userId: payment.fromUserId,
          groupId: payment.groupId,
          type: 'payment_received',
          title: 'Payment received',
          description: `Payment of $${payment.amount} received from ${user?.fullName}`,
        });
      }
      
      res.json(payment);
    } catch (error) {
      res.status(500).json({ message: "Failed to update payment", error });
    }
  });

  // Activity endpoints
  app.get("/api/activities", async (req, res) => {
    try {
      const { userId, limit } = req.query;
      if (!userId) {
        return res.status(400).json({ message: "userId required" });
      }
      
      const activities = await storage.getUserActivities(
        userId as string, 
        limit ? parseInt(limit as string) : undefined
      );
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
