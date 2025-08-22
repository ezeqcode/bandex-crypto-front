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

export type InvoiceStatus = 'PENDING' | 'ASSIGNED_TO_CUSTOMER' | 'PROCESSED';
export type Gateway = 'FIREBANKING' | 'ETHER';
export type UserRole = 'ADMIN' | 'OPERATOR' | 'AUDITOR';