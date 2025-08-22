import api from './baseApi';
import { Quote, FormattedQuote, SupportedCoins, NetworkFee } from '@/types';

export const quotesApi = {
  // Buscar todas as cotações
  getQuotes: async (): Promise<Quote[]> => {
    const response = await api.get('/quotes');
    return response.data;
  },

  // Buscar cotação por moeda
  getQuoteBySymbol: async (symbol: string): Promise<Quote> => {
    const response = await api.get(`/quotes/${symbol}`);
    return response.data;
  },

  // Buscar cotação formatada
  getFormattedQuote: async (symbol: string): Promise<FormattedQuote> => {
    const response = await api.get(`/quotes/${symbol}/formatted`);
    return response.data;
  },

  // Buscar moedas suportadas
  getSupportedCoins: async (): Promise<SupportedCoins> => {
    const response = await api.get('/quotes/supported');
    return response.data;
  },

  // Buscar taxas de rede
  getNetworkFees: async (symbol?: string): Promise<NetworkFee[]> => {
    const url = symbol ? `/quotes/network-fees?symbol=${symbol}` : '/quotes/network-fees';
    const response = await api.get(url);
    return response.data;
  },
};