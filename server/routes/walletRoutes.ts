import { Router } from "express";
import { walletService } from "../services/walletService";
import { z } from "zod";

const router = Router();

// Get wallet balance for a group
router.get("/groups/:groupId/wallet/balance", async (req, res) => {
  try {
    const { groupId } = req.params;
    const wallet = await walletService.getWalletByGroup(groupId);
    
    if (!wallet) {
      return res.status(404).json({ error: "Group wallet not found" });
    }
    
    const balance = await walletService.getWalletBalance(wallet.id);
    res.json({ balance, currency: wallet.currency });
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    res.status(500).json({ error: "Failed to fetch wallet balance" });
  }
});

// Get wallet transactions for a group
router.get("/groups/:groupId/wallet/transactions", async (req, res) => {
  try {
    const { groupId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const wallet = await walletService.getWalletByGroup(groupId);
    
    if (!wallet) {
      return res.status(404).json({ error: "Group wallet not found" });
    }
    
    const transactions = await walletService.getWalletTransactions(wallet.id, limit);
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching wallet transactions:", error);
    res.status(500).json({ error: "Failed to fetch wallet transactions" });
  }
});

// Transfer funds between wallets
const transferSchema = z.object({
  fromWalletId: z.string(),
  toWalletId: z.string(),
  amount: z.number().positive(),
  description: z.string(),
});

router.post("/transfer", async (req, res) => {
  try {
    const transferData = transferSchema.parse(req.body);
    const transaction = await walletService.transferFunds(transferData);
    res.json(transaction);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid transfer data", details: error.errors });
    }
    console.error("Error transferring funds:", error);
    res.status(500).json({ error: "Failed to transfer funds" });
  }
});

export default router;