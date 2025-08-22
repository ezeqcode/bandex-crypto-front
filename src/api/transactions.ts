import api from './baseApi';
import { Transaction, CreateBuyOrderRequest, CustomerBalanceResponse } from '@/types';

export const transactionsApi = {
  // Create a buy order (BRL -> Crypto conversion)
  createBuyOrder: async (data: CreateBuyOrderRequest): Promise<Transaction> => {
    const response = await api.post('/transactions/buy-order', data);
    return response.data;
  },

  // List all transactions
  getTransactions: async (): Promise<Transaction[]> => {
    const response = await api.get('/transactions');
    return response.data;
  },

  // Get transactions for a specific customer
  getCustomerTransactions: async (customerId: string): Promise<Transaction[]> => {
    const response = await api.get(`/transactions/customer/${customerId}`);
    return response.data;
  },

  // Cancel a transaction (only PENDING status)
  cancelTransaction: async (transactionId: string): Promise<Transaction> => {
    const response = await api.patch(`/transactions/${transactionId}/cancel`);
    return response.data;
  },

  // Get specific customer balance for a currency
  getCustomerBalance: async (customerId: string, currency: string): Promise<CustomerBalanceResponse> => {
    const response = await api.get(`/customers/${customerId}/balance/${currency}`);
    return response.data;
  },

  // Get transactions that failed on Ether API
  getEtherFailedTransactions: async (): Promise<Transaction[]> => {
    const response = await api.get('/transactions/ether-failed');
    return response.data;
  },

  // Get manual pending transactions
  getManualPendingTransactions: async (): Promise<Transaction[]> => {
    const response = await api.get('/transactions/manual-pending');
    return response.data;
  },

  // Convert transaction to manual mode
  convertToManual: async (transactionId: string): Promise<Transaction> => {
    const response = await api.patch(`/transactions/${transactionId}/convert-to-manual`);
    return response.data;
  },

  // Confirm manual transfer completion
  confirmManualTransfer: async (transactionId: string): Promise<Transaction> => {
    const response = await api.patch(`/transactions/${transactionId}/confirm-manual`);
    return response.data;
  },
};