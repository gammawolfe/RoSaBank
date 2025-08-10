export interface Wallet {
  id: string;
  userId?: string; // null for group wallets
  groupId?: string; // null for personal wallets
  currency: string;
  balance: number;
  isGroupWallet: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  fromWalletId?: string;
  toWalletId?: string;
  amount: number;
  currency: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  status: 'pending' | 'completed' | 'failed';
  description: string;
  createdAt: Date;
}

export interface CreateWalletRequest {
  userId?: string;
  groupId?: string;
  currency: string;
  isGroupWallet: boolean;
}

export interface TransferRequest {
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  description: string;
}