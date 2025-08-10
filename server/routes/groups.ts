import type { Express } from "express";
import { storage } from "../storage";
import { insertSavingsGroupSchema, insertGroupMemberSchema } from "@shared/schema";

export function registerGroupRoutes(app: Express) {
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
}