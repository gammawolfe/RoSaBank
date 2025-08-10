import { type GroupMember, type InsertGroupMember, type User } from "@shared/schema";
import { type IMemberStorage, type IUserStorage } from "./interfaces";
import { randomUUID } from "crypto";

export class MemMemberStorage implements IMemberStorage {
  private groupMembers: Map<string, GroupMember> = new Map();

  constructor(private userStorage: IUserStorage) {}

  async getGroupMembers(groupId: string): Promise<(GroupMember & { user: User })[]> {
    const members = Array.from(this.groupMembers.values())
      .filter(member => member.groupId === groupId)
      .sort((a, b) => a.turnOrder - b.turnOrder);
    
    const membersWithUsers = [];
    for (const member of members) {
      const user = await this.userStorage.getUser(member.userId);
      if (user) {
        membersWithUsers.push({ ...member, user });
      }
    }
    
    return membersWithUsers;
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

  // Helper method to get user memberships across all groups
  async getUserMemberships(userId: string): Promise<GroupMember[]> {
    return Array.from(this.groupMembers.values())
      .filter(member => member.userId === userId);
  }
}