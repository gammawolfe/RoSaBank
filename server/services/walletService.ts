import type { Wallet, WalletTransaction, CreateWalletRequest, TransferRequest } from "@shared/wallet";

class WalletService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.WALLET_API_KEY || '';
    this.baseUrl = process.env.WALLET_SERVICE_URL || 'http://localhost:3001';
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Wallet API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async createWallet(request: CreateWalletRequest): Promise<Wallet> {
    return this.makeRequest<Wallet>('/api/wallets', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getWallet(walletId: string): Promise<Wallet> {
    return this.makeRequest<Wallet>(`/api/wallets/${walletId}`);
  }

  async getWalletsByUser(userId: string): Promise<Wallet[]> {
    return this.makeRequest<Wallet[]>(`/api/wallets?userId=${userId}`);
  }

  async getWalletByGroup(groupId: string): Promise<Wallet | null> {
    try {
      return this.makeRequest<Wallet>(`/api/wallets/group/${groupId}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async getWalletBalance(walletId: string): Promise<number> {
    const wallet = await this.getWallet(walletId);
    return wallet.balance;
  }

  async transferFunds(request: TransferRequest): Promise<WalletTransaction> {
    return this.makeRequest<WalletTransaction>('/api/wallets/transfer', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getWalletTransactions(walletId: string, limit = 50): Promise<WalletTransaction[]> {
    return this.makeRequest<WalletTransaction[]>(`/api/wallets/${walletId}/transactions?limit=${limit}`);
  }

  async depositToWallet(walletId: string, amount: number, description: string): Promise<WalletTransaction> {
    return this.makeRequest<WalletTransaction>(`/api/wallets/${walletId}/deposit`, {
      method: 'POST',
      body: JSON.stringify({ amount, description }),
    });
  }

  async withdrawFromWallet(walletId: string, amount: number, description: string): Promise<WalletTransaction> {
    return this.makeRequest<WalletTransaction>(`/api/wallets/${walletId}/withdraw`, {
      method: 'POST',
      body: JSON.stringify({ amount, description }),
    });
  }
}

export const walletService = new WalletService();