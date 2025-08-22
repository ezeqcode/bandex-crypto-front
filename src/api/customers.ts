import api from './baseApi';
import { Customer, CreateCustomerRequest, CustomerBalance, UpdateCustomerBalanceRequest } from '@/types';

export const customersApi = {
  getCustomers: async (): Promise<Customer[]> => {
    const response = await api.get('/customers');
    return response.data;
  },

  createCustomer: async (data: CreateCustomerRequest): Promise<Customer> => {
    const response = await api.post('/customers', data);
    return response.data;
  },

  getCustomerBalance: async (customerId: string, currency: string): Promise<string> => {
    const response = await api.get(`/customers/${customerId}/balance/${currency}`);
    return response.data;
  },

  updateCustomerBalance: async (
    customerId: string, 
    currency: string, 
    data: UpdateCustomerBalanceRequest
  ): Promise<CustomerBalance> => {
    const response = await api.patch(`/customers/${customerId}/balance/${currency}`, data);
    return response.data;
  },
};