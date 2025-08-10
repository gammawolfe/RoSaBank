import { type SavingsGroup, type InsertSavingsGroup, type GroupWithMembers, type User, type GroupMember } from "@shared/schema";
import { type IGroupStorage, type IMemberStorage, type IPaymentStorage, type IUserStorage } from "./interfaces";
import { randomUUID } from "crypto";

export class MemGroupStorage implements IGroupStorage {
  private savingsGroups: Map<string, SavingsGroup> = new Map();

  constructor(
    private memberStorage: IMemberStorage,
    private paymentStorage: IPaymentStorage,
    private userStorage: IUserStorage
  ) {}

  async getSavingsGroup(id: string): Promise<SavingsGroup | undefined> {
    return this.savingsGroups.get(id);
  }

  async getUserGroups(userId: string): Promise<GroupWithMembers[]> {
    // First get all groups where user is a member
    const userMemberships = (await this.memberStorage.getUserMemberships(userId));
    
    const groups: GroupWithMembers[] = [];
    
    for (const membership of userMemberships) {
      const group = this.savingsGroups.get(membership.groupId);
      if (!group) continue;
      
      const members = await this.memberStorage.getGroupMembers(group.id);
      const payments = await this.paymentStorage.getGroupPayments(group.id);
      
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
      currency: insertGroup.currency || 'USD',
      currentRound: 1,
      currentTurnIndex: 0,
      isActive: true,
      createdAt: new Date(),
    };
    this.savingsGroups.set(id, group);
    
    // Add creator as first member and admin
    await this.memberStorage.addGroupMember({
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
}