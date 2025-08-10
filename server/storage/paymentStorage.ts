import { type Payment, type InsertPayment, type PaymentWithDetails, type User, type SavingsGroup } from "@shared/schema";
import { type IPaymentStorage, type IUserStorage, type IGroupStorage } from "./interfaces";
import { randomUUID } from "crypto";

export class MemPaymentStorage implements IPaymentStorage {
  private payments: Map<string, Payment> = new Map();

  constructor(
    private userStorage: IUserStorage,
    private groupStorage: IGroupStorage
  ) {}

  async getPayment(id: string): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async getGroupPayments(groupId: string): Promise<PaymentWithDetails[]> {
    const payments = Array.from(this.payments.values())
      .filter(payment => payment.groupId === groupId);
    
    const paymentsWithDetails = [];
    for (const payment of payments) {
      const fromUser = await this.userStorage.getUser(payment.fromUserId);
      const toUser = payment.toUserId ? await this.userStorage.getUser(payment.toUserId) : undefined;
      const group = await this.groupStorage.getSavingsGroup(payment.groupId);
      
      if (fromUser && group) {
        paymentsWithDetails.push({
          ...payment,
          fromUser,
          toUser,
          group,
        });
      }
    }
    
    return paymentsWithDetails;
  }

  async getUserPayments(userId: string): Promise<PaymentWithDetails[]> {
    const payments = Array.from(this.payments.values())
      .filter(payment => payment.fromUserId === userId || payment.toUserId === userId);
    
    const paymentsWithDetails = [];
    for (const payment of payments) {
      const fromUser = await this.userStorage.getUser(payment.fromUserId);
      const toUser = payment.toUserId ? await this.userStorage.getUser(payment.toUserId) : undefined;
      const group = await this.groupStorage.getSavingsGroup(payment.groupId);
      
      if (fromUser && group) {
        paymentsWithDetails.push({
          ...payment,
          fromUser,
          toUser,
          group,
        });
      }
    }
    
    return paymentsWithDetails;
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
}