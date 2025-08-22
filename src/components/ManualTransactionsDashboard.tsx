import React, { useState, useEffect } from 'react';
import { transactionsApi } from '@/api';
import { Transaction } from '@/types';
import { formatCurrency, formatNumber } from '@/utils/formatters';

interface ManualTransactionsDashboardProps {
  onRefreshNeeded?: () => void;
}

const ManualTransactionsDashboard: React.FC<ManualTransactionsDashboardProps> = ({ onRefreshNeeded }) => {
  const [activeTab, setActiveTab] = useState<'ether-failed' | 'manual-pending'>('ether-failed');
  const [etherFailedTransactions, setEtherFailedTransactions] = useState<Transaction[]>([]);
  const [manualPendingTransactions, setManualPendingTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTransactions();
    
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(loadTransactions, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const [etherFailed, manualPending] = await Promise.all([
        transactionsApi.getEtherFailedTransactions(),
        transactionsApi.getManualPendingTransactions()
      ]);
      
      setEtherFailedTransactions(etherFailed);
      setManualPendingTransactions(manualPending);
    } catch (error) {
      console.error('Error loading manual transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToManual = async (transactionId: string) => {
    if (!confirm('Converter esta transação para modo manual? Você precisará fazer a transferência externamente.')) {
      return;
    }

    try {
      await transactionsApi.convertToManual(transactionId);
      alert('Transação convertida para modo manual!');
      loadTransactions();
      onRefreshNeeded?.();
    } catch (error: any) {
      console.error('Error converting to manual:', error);
      alert(error.response?.data?.message || 'Erro ao converter para modo manual');
    }
  };

  const handleConfirmManualTransfer = async (transactionId: string) => {
    if (!confirm('Confirmar que a transferência foi realizada externamente? Isso creditará a cripto no cliente.')) {
      return;
    }

    try {
      await transactionsApi.confirmManualTransfer(transactionId);
      alert('Transferência confirmada! Cripto creditada no cliente.');
      loadTransactions();
      onRefreshNeeded?.();
    } catch (error: any) {
      console.error('Error confirming manual transfer:', error);
      alert(error.response?.data?.message || 'Erro ao confirmar transferência manual');
    }
  };

  const handleCancelTransaction = async (transactionId: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta transação? O valor BRL será devolvido ao cliente.')) {
      return;
    }

    try {
      await transactionsApi.cancelTransaction(transactionId);
      alert('Transação cancelada! Valor BRL devolvido ao cliente.');
      loadTransactions();
      onRefreshNeeded?.();
    } catch (error: any) {
      console.error('Error canceling transaction:', error);
      alert(error.response?.data?.message || 'Erro ao cancelar transação');
    }
  };


  if (etherFailedTransactions.length === 0 && manualPendingTransactions.length === 0) {
    return null; // Não mostra o dashboard se não houver transações manuais
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">⚠️ Transações Manuais</h2>
              <p className="text-sm text-gray-600">Transações que precisam de intervenção manual</p>
            </div>
          </div>
          {loading && (
            <div className="animate-spin h-5 w-5 border-2 border-orange-500 rounded-full border-t-transparent"></div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          <button
            onClick={() => setActiveTab('ether-failed')}
            className={`py-4 px-6 text-sm font-medium border-b-2 ${
              activeTab === 'ether-failed'
                ? 'border-red-500 text-red-600 bg-red-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Falhas na Ether
            {etherFailedTransactions.length > 0 && (
              <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                {etherFailedTransactions.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('manual-pending')}
            className={`py-4 px-6 text-sm font-medium border-b-2 ${
              activeTab === 'manual-pending'
                ? 'border-orange-500 text-orange-600 bg-orange-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Aguardando Confirmação
            {manualPendingTransactions.length > 0 && (
              <span className="ml-2 bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
                {manualPendingTransactions.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="p-0">
        {activeTab === 'ether-failed' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor BRL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cripto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Erro da Ether
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {etherFailedTransactions.map(transaction => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.customer?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.customer?.document}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(transaction.amountBrl)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatNumber(transaction.amountCrypto, 6)} {transaction.cryptoCurrency}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-red-600 max-w-xs truncate" title={transaction.etherError}>
                        {transaction.etherError || 'Erro desconhecido'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleConvertToManual(transaction.id)}
                        className="bg-orange-500 text-white px-3 py-1 rounded-lg hover:bg-orange-600 transition-colors text-xs"
                      >
                        Converter p/ Manual
                      </button>
                      <button
                        onClick={() => handleCancelTransaction(transaction.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors text-xs"
                      >
                        Cancelar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {etherFailedTransactions.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <div className="mb-4">
                  <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="font-medium">Nenhuma transação com falha na Ether</p>
                <p className="text-sm mt-1">Todas as transações estão funcionando normalmente</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'manual-pending' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor BRL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cripto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Convertido por
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {manualPendingTransactions.map(transaction => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.customer?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.customer?.document}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(transaction.amountBrl)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatNumber(transaction.amountCrypto, 6)} {transaction.cryptoCurrency}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.manualConfirmedBy || 'Sistema'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleConfirmManualTransfer(transaction.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-colors text-xs"
                      >
                        Confirmar Transferência
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {manualPendingTransactions.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <div className="mb-4">
                  <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="font-medium">Nenhuma transação manual pendente</p>
                <p className="text-sm mt-1">Todas as transferências manuais foram confirmadas</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManualTransactionsDashboard;