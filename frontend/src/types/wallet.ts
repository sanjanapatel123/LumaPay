export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

export interface Wallet {
  balancePaise: number;
  balanceRupees?: number;
}

export interface TopUp {
  _id: string;
  amountPaise: number;
  status: PaymentStatus;
  createdAt: string;
  updatedAt?: string;
  creditedAt?: string;
}

export interface CreateTopUpResponse {
  gatewayUrl: string;
  topUp?: TopUp;
}

export interface LoginResponse {
  token: string;
  user?: {
    id?: string;
    name?: string;
    email?: string;
  };
}

export interface ApiError {
  success?: boolean;
  message: string;
}

export interface BalanceUpdate {
  balancePaise: number;
  balanceRupees: number;
}
