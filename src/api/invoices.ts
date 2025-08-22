import api from './baseApi';
import { Invoice, InvoiceStatus, Gateway } from '@/types';

interface InvoiceFilters {
  status?: InvoiceStatus;
  gateway?: Gateway;
  customerId?: string;
  startDate?: string;
  endDate?: string;
}

export const invoicesApi = {
  getInvoices: async (filters?: InvoiceFilters): Promise<Invoice[]> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const response = await api.get(`/invoices?${params.toString()}`);
    return response.data;
  },

  getPendingInvoices: async (): Promise<Invoice[]> => {
    const response = await api.get('/invoices/pending');
    return response.data;
  },

  searchByEndToEnd: async (endToEnd: string): Promise<Invoice[]> => {
    const response = await api.get(`/invoices/search/end-to-end/${endToEnd}`);
    return response.data;
  },

  getCustomerInvoices: async (customerId: string): Promise<Invoice[]> => {
    const response = await api.get(`/invoices/customer/${customerId}`);
    return response.data;
  },

  assignInvoice: async (id: string, customerId: string): Promise<Invoice> => {
    const response = await api.patch(`/invoices/${id}/assign`, { customerId });
    return response.data;
  },

  processInvoice: async (id: string): Promise<Invoice> => {
    const response = await api.patch(`/invoices/${id}/process`);
    return response.data;
  },
};