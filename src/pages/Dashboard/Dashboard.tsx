import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { webhooksApi, invoicesApi, customersApi, transactionsApi } from '@/api';
import { WebhookStatistics, Invoice, Customer, Transaction } from '@/types';

const Dashboard: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [webhookStats, setWebhookStats] = useState<WebhookStatistics | null>(null);
  const [pendingInvoices, setPendingInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const promises: Promise<any>[] = [];

        if (hasPermission('webhooks:read')) {
          promises.push(webhooksApi.getWebhookStatistics());
        }
        if (hasPermission('invoices:read')) {
          promises.push(invoicesApi.getPendingInvoices());
        }
        if (hasPermission('customers:read')) {
          promises.push(customersApi.getCustomers());
        }
        if (hasPermission('transactions:read')) {
          promises.push(transactionsApi.getTransactions());
        }

        const results = await Promise.allSettled(promises);
        
        let index = 0;
        if (hasPermission('webhooks:read')) {
          const webhookResult = results[index];
          if (webhookResult.status === 'fulfilled') {
            setWebhookStats(webhookResult.value);
          }
          index++;
        }
        
        if (hasPermission('invoices:read')) {
          const invoiceResult = results[index];
          if (invoiceResult.status === 'fulfilled') {
            setPendingInvoices(invoiceResult.value);
          }
          index++;
        }
        
        if (hasPermission('customers:read')) {
          const customerResult = results[index];
          if (customerResult.status === 'fulfilled') {
            setCustomers(customerResult.value);
          }
          index++;
        }
        
        if (hasPermission('transactions:read')) {
          const transactionResult = results[index];
          if (transactionResult.status === 'fulfilled') {
            setTransactions(transactionResult.value);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [hasPermission]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Olá, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-gray-600">Aqui está o resumo da Mesa OTC hoje</p>
          </div>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl font-medium transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Processar Invoice
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Total Webhooks</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-green-600 font-medium">{webhookStats ? webhookStats.processed : 0} processados</span>
                <span className="text-xs text-gray-500">de {webhookStats ? webhookStats.total : 0}</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {webhookStats ? webhookStats.total.toLocaleString() : '0'}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Invoices Pendentes</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-yellow-600 font-medium">• {pendingInvoices.length}</span>
                <span className="text-xs text-gray-500">aguardando</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            R$ {pendingInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount || '0'), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Clientes Ativos</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-green-600 font-medium">{customers.filter(c => c.isActive).length}</span>
                <span className="text-xs text-gray-500">de {customers.length} total</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {customers.filter(c => c.isActive).length}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Conversões Hoje</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-purple-600 font-medium">{transactions.filter(t => t.status === 'PENDING').length}</span>
                <span className="text-xs text-gray-500">pendentes</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            R$ {transactions.reduce((sum, tx) => sum + parseFloat(tx.spread || '0'), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Financial Operations Section */}
      <div className="bg-white rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Operações Financeiras</h2>
          <div className="flex gap-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Invoices Pendentes <span className="ml-2 text-gray-900 font-bold">{pendingInvoices.length}</span></div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Transações Pendentes <span className="ml-2 text-gray-900 font-bold">{transactions.filter(t => t.status === 'PENDING').length}</span></div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Lucro Total <span className="ml-2 text-gray-900 font-bold">R$ {transactions.reduce((sum, tx) => sum + parseFloat(tx.spread || '0'), 0).toFixed(2)}</span></div>
          </div>
        </div>

        {/* Financial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Webhooks por Gateway */}
          {webhookStats && webhookStats.byGateway.map((gateway, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{gateway.gateway}</h4>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  {gateway.count} webhooks processados
                </div>
                <div className="text-lg font-bold text-gray-900">
                  Gateway {gateway.gateway}
                </div>
              </div>
            </div>
          ))}

          {/* Invoices Pendentes */}
          {pendingInvoices.slice(0, 3).map((invoice) => (
            <div key={invoice.id} className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                    PENDENTE
                  </span>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">{invoice.gatewayTransactionId}</h4>
              <p className="text-sm text-gray-600 mb-3">{invoice.payerInfo.name}</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  R$ {parseFloat(invoice.amount).toFixed(2)}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4H8zM8 7h8m-8 0L8 21h8l0-14" />
                  </svg>
                  {new Date(invoice.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real data section - Hidden by default for mockup */}
      <div className="hidden">
        {webhookStats && webhookStats.byGateway.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Webhooks por Gateway</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {webhookStats.byGateway.map((gateway, index) => (
                <div key={index} className="border p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900">{gateway.gateway}</h4>
                  <p className="text-xl font-bold text-blue-600">{gateway.count}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;