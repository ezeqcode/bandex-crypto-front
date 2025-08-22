export interface Role {
  id: string;
  name: 'ADMIN' | 'OPERATOR' | 'AUDITOR';
  permissions: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  isActive?: boolean;
  role: string | Role; // Pode ser string ou objeto Role
  permissions?: string[]; // Pode estar no user ou no role
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerBalance {
  id: string;
  customerId: string;
  currency: string;
  balance: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  document: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  balances: CustomerBalance[];
  createdAt: string;
  updatedAt: string;
}

export interface Webhook {
  id: string;
  gateway: 'FIREBANKING' | 'ETHER';
  payload: any;
  processed: boolean;
  createdAt: string;
}

export interface Invoice {
  id: string;
  status: 'PENDING' | 'ASSIGNED_TO_CUSTOMER' | 'PROCESSED';
  gatewayTransactionId: string;
  endToEnd?: string;
  gateway: 'FIREBANKING' | 'ETHER';
  amount: string;
  payerInfo: {
    name: string;
    document: string;
  };
  webhookId: string;
  customerId?: string;
  customer?: Customer;
  webhook: Webhook;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  roleId: string;
  isActive: boolean;
}

export interface UpdateUserRequest {
  name?: string;
  isActive?: boolean;
}

export interface CreateCustomerRequest {
  name: string;
  document: string;
  email?: string;
  phone?: string;
  isActive: boolean;
}

export interface UpdateCustomerBalanceRequest {
  amount: string;
}

export interface AssignInvoiceRequest {
  customerId: string;
}

export interface WebhookStatistics {
  total: number;
  processed: number;
  unprocessed: number;
  byGateway: Array<{
    gateway: string;
    count: string;
  }>;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

export interface Transaction {
  id: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'ETHER_FAILED' | 'MANUAL_PENDING';
  customerId: string;
  customer?: Customer;
  type: 'BUY';
  amountBrl: string;
  amountCrypto: string;
  cryptoCurrency: string;
  exchangeRate: string;
  marketRate: string;
  spreadPercentage: number;
  feePercentage: number;
  spread: string;
  etherTxId?: string;
  isManual: boolean;
  etherError?: string;
  manualConfirmedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBuyOrderRequest {
  customerId: string;
  amountBrl: string;
  marketRate: string;
  cryptoCurrency: string;
  spreadPercentage: number;
  feePercentage: number;
}

export interface CustomerBalanceResponse {
  customerId: string;
  currency: string;
  balance: string;
}

export interface Quote {
  id: number;
  name: string;
  symbol: string;
  networks: string[];
  image: string;
  decimals: number;
  price: number;
  canDeposit: boolean;
  canWithdraw: boolean;
  fee: string;
  minDeposit: string;
  minWithdraw: string;
}

export interface FormattedQuote {
  symbol: string;
  name: string;
  price: number;
  priceFormatted: string;
  networks: string[];
  canDeposit: boolean;
  canWithdraw: boolean;
  minDeposit: string;
  minWithdraw: string;
  fees: NetworkFee[];
}

export interface NetworkFee {
  network: string;
  networkFullName: string;
  time: string;
  fee: string;
  feeUsd: number;
  feeBrl: number;
}

export interface SupportedCoins {
  coins: string[];
}

export type InvoiceStatus = 'PENDING' | 'ASSIGNED_TO_CUSTOMER' | 'PROCESSED';
export type Gateway = 'FIREBANKING' | 'ETHER';
export type UserRole = 'ADMIN' | 'OPERATOR' | 'AUDITOR';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'ETHER_FAILED' | 'MANUAL_PENDING';
export type CryptoCurrency = 'USDT' | 'BTC' | 'ETH';