import api from './baseApi';
import { Webhook, WebhookStatistics } from '@/types';

export const webhooksApi = {
  getWebhooks: async (): Promise<Webhook[]> => {
    const response = await api.get('/webhooks');
    return response.data;
  },

  getWebhookStatistics: async (): Promise<WebhookStatistics> => {
    const response = await api.get('/webhooks/statistics');
    return response.data;
  },

  getUnprocessedWebhooks: async (): Promise<Webhook[]> => {
    const response = await api.get('/webhooks/unprocessed');
    return response.data;
  },

  retryWebhook: async (id: string): Promise<void> => {
    await api.post(`/webhooks/${id}/retry`);
  },
};