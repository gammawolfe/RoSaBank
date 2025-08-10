import type { Express } from "express";
import { storage } from "../storage";
import { insertPaymentSchema } from "@shared/schema";

export function registerPaymentRoutes(app: Express) {
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
}