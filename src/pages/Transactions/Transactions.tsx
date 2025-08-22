import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import MaskedInput from '@/components/MaskedInput';
import ManualTransactionsDashboard from '@/components/ManualTransactionsDashboard';
import { customersApi, transactionsApi, quotesApi } from '@/api';
import { Customer, Transaction, CreateBuyOrderRequest, CryptoCurrency, FormattedQuote } from '@/types';
import { formatCurrency, formatNumber } from '@/utils/formatters';

function Transactions() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [supportedCoins, setSupportedCoins] = useState<string[]>(['USDT', 'BTC', 'ETH']);
  const [currentQuote, setCurrentQuote] = useState<FormattedQuote | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [lastQuoteUpdate, setLastQuoteUpdate] = useState<Date | null>(null);
  const [formData, setFormData] = useState<CreateBuyOrderRequest>({
    customerId: '',
    amountBrl: '',
    marketRate: '',
    cryptoCurrency: 'USDT',
    spreadPercentage: 2.5,
    feePercentage: 1.0,
  });

  // Calculation states
  const [cryptoAmount, setCryptoAmount] = useState<string>('0');
  const [profit, setProfit] = useState<string>('0');
  const [finalRate, setFinalRate] = useState<string>('0');

  useEffect(() => {
    loadCustomers();
    loadTransactions();
    loadSupportedCoins();
    fetchQuoteForCurrency(formData.cryptoCurrency);
  }, []);

  useEffect(() => {
    fetchQuoteForCurrency(formData.cryptoCurrency);
  }, [formData.cryptoCurrency]);

  // Auto-refresh cotações a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      if (formData.cryptoCurrency) {
        fetchQuoteForCurrency(formData.cryptoCurrency);
      }
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [formData.cryptoCurrency]);

  useEffect(() => {
    calculateConversion();
  }, [formData.amountBrl, formData.marketRate, formData.spreadPercentage, formData.feePercentage]);

  const loadCustomers = async () => {
    try {
      const data = await customersApi.getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const data = await transactionsApi.getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const loadSupportedCoins = async () => {
    try {
      const data = await quotesApi.getSupportedCoins();
      setSupportedCoins(data.coins);
    } catch (error) {
      console.error('Error loading supported coins:', error);
      // Fallback para moedas padrão
      setSupportedCoins(['USDT', 'BTC', 'ETH']);
    }
  };

  const fetchQuoteForCurrency = async (symbol: string) => {
    if (!symbol) return;
    
    setLoadingQuote(true);
    try {
      const quote = await quotesApi.getFormattedQuote(symbol);
      setCurrentQuote(quote);
      setLastQuoteUpdate(new Date());
      
      // Atualiza automaticamente o campo de cotação se estiver vazio
      if (!formData.marketRate || formData.marketRate === '0') {
        setFormData(prev => ({ ...prev, marketRate: quote.price.toString() }));
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
      setCurrentQuote(null);
    } finally {
      setLoadingQuote(false);
    }
  };

  const refreshQuote = () => {
    fetchQuoteForCurrency(formData.cryptoCurrency);
  };

  const calculateConversion = () => {
    const amountBrl = parseFloat(formData.amountBrl) || 0;
    const marketRate = parseFloat(formData.marketRate) || 0;
    const spreadPercentage = formData.spreadPercentage || 0;
    const feePercentage = formData.feePercentage || 0;

    if (amountBrl > 0 && marketRate > 0) {
      // Calculate final rate with spread and fee
      const spreadAmount = (amountBrl * spreadPercentage) / 100;
      const feeAmount = (amountBrl * feePercentage) / 100;
      const totalCharges = spreadAmount + feeAmount;
      
      // Final rate includes spread and fee
      const finalRateValue = marketRate * (1 + (spreadPercentage + feePercentage) / 100);
      
      // Crypto amount the customer will receive
      const cryptoAmountValue = amountBrl / finalRateValue;
      
      setCryptoAmount(cryptoAmountValue.toFixed(6));
      setProfit(totalCharges.toFixed(2));
      setFinalRate(finalRateValue.toFixed(2));
    } else {
      setCryptoAmount('0');
      setProfit('0');
      setFinalRate('0');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerId || !formData.amountBrl || !formData.marketRate) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const selectedCustomer = customers.find(c => c.id === formData.customerId);
    const brlBalance = selectedCustomer?.balances.find(b => b.currency === 'BRL');
    const availableBalance = parseFloat(brlBalance?.balance || '0');
    const requestedAmount = parseFloat(formData.amountBrl);

    if (requestedAmount > availableBalance) {
      alert(`Saldo insuficiente. Disponível: ${formatCurrency(availableBalance)}, Solicitado: ${formatCurrency(requestedAmount)}`);
      return;
    }

    setLoading(true);
    try {
      await transactionsApi.createBuyOrder(formData);
      alert('Pedido de compra criado com sucesso!');
      loadTransactions();
      loadCustomers(); // Reload to update balances
      
      // Reset form
      setFormData({
        customerId: '',
        amountBrl: '',
        marketRate: '',
        cryptoCurrency: 'USDT',
        spreadPercentage: 2.5,
        feePercentage: 1.0,
      });
    } catch (error: any) {
      console.error('Error creating buy order:', error);
      alert(error.response?.data?.message || 'Erro ao criar pedido de compra');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTransaction = async (transactionId: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta transação?')) {
      return;
    }

    try {
      await transactionsApi.cancelTransaction(transactionId);
      alert('Transação cancelada com sucesso!');
      loadTransactions();
      loadCustomers(); // Reload to update balances
    } catch (error: any) {
      console.error('Error canceling transaction:', error);
      alert(error.response?.data?.message || 'Erro ao cancelar transação');
    }
  };

  const selectedCustomer = customers.find(c => c.id === formData.customerId);
  const brlBalance = selectedCustomer?.balances.find(b => b.currency === 'BRL');

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 p-4 md:p-8 max-w-full overflow-hidden">
      <PageHeader 
        title="Conversões BRL → Cripto"
        subtitle="Gerencie conversões de moeda e transações"
      />

      {/* Manual Transactions Dashboard */}
      <ManualTransactionsDashboard onRefreshNeeded={loadTransactions} />

      {/* Conversion Form */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Nova Conversão</h2>
          <p className="text-sm text-gray-600">Crie uma nova conversão BRL para criptomoeda</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Customer Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cliente *
              </label>
              <select
                value={formData.customerId}
                onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                required
              >
                <option value="">Selecione um cliente</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.document}
                  </option>
                ))}
              </select>
              {selectedCustomer && brlBalance && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 font-medium">
                    💰 Saldo disponível: {formatCurrency(brlBalance.balance)}
                  </p>
                </div>
              )}
            </div>

            {/* Amount in BRL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor em BRL *
              </label>
              <MaskedInput
                type="currency"
                value={formData.amountBrl}
                onChange={(value) => setFormData(prev => ({ ...prev, amountBrl: value }))}
                placeholder="1.000,00"
                prefix="R$"
                required
              />
            </div>

            {/* Market Rate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Cotação do Mercado *
                </label>
                <button
                  type="button"
                  onClick={refreshQuote}
                  disabled={loadingQuote}
                  className="flex items-center space-x-1 text-xs text-orange-600 hover:text-orange-700 disabled:opacity-50"
                >
                  {loadingQuote ? (
                    <div className="animate-spin h-3 w-3 border border-orange-600 rounded-full border-t-transparent"></div>
                  ) : (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  <span>Atualizar</span>
                </button>
              </div>
              <MaskedInput
                type="currency"
                value={formData.marketRate}
                onChange={(value) => setFormData(prev => ({ ...prev, marketRate: value }))}
                placeholder="5,50"
                prefix="R$"
                required
              />
              {currentQuote && lastQuoteUpdate && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm text-blue-700 font-medium">
                        Cotação atual: {currentQuote.priceFormatted}
                      </span>
                    </div>
                    <span className="text-xs text-blue-600">
                      {lastQuoteUpdate.toLocaleTimeString('pt-BR')}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    {currentQuote.networks.length > 0 && (
                      <span className="text-xs text-blue-600">
                        Redes: {currentQuote.networks.join(', ')}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, marketRate: currentQuote.price.toString() }))}
                      className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1 rounded transition-colors"
                    >
                      Usar cotação atual
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Crypto Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Criptomoeda
              </label>
              <div className="relative">
                <select
                  value={formData.cryptoCurrency}
                  onChange={(e) => setFormData(prev => ({ ...prev, cryptoCurrency: e.target.value as CryptoCurrency }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors appearance-none"
                >
                  {supportedCoins.map(crypto => (
                    <option key={crypto} value={crypto}>
                      {crypto}
                      {currentQuote && currentQuote.symbol === crypto && ` - ${currentQuote.priceFormatted}`}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Spread Percentage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Spread (%)
              </label>
              <MaskedInput
                type="percentage"
                value={formData.spreadPercentage.toString()}
                onChange={(value) => setFormData(prev => ({ ...prev, spreadPercentage: parseFloat(value) || 0 }))}
                placeholder="2,50"
                suffix="%"
              />
            </div>

            {/* Fee Percentage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taxa (%)
              </label>
              <MaskedInput
                type="percentage"
                value={formData.feePercentage.toString()}
                onChange={(value) => setFormData(prev => ({ ...prev, feePercentage: parseFloat(value) || 0 }))}
                placeholder="1,00"
                suffix="%"
              />
            </div>
          </div>

          {/* Real-time Calculations */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Cálculos em Tempo Real</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Cliente receberá</p>
                <p className="text-lg font-bold text-green-600">{formatNumber(cryptoAmount, 6)}</p>
                <p className="text-xs text-gray-500">{formData.cryptoCurrency}</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Nosso lucro</p>
                <p className="text-lg font-bold text-blue-600">{formatCurrency(profit)}</p>
                <p className="text-xs text-gray-500">Spread + Taxa</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Taxa final</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(finalRate)}</p>
                <p className="text-xs text-gray-500">por {formData.cryptoCurrency}</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Criando Pedido...' : 'Criar Pedido de Compra'}
            </button>
          </div>
        </form>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Histórico de Transações</h2>
              <p className="text-sm text-gray-600">{transactions.length} transações encontradas</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-sm text-gray-500">
                <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                {transactions.filter(t => t.status === 'PENDING').length} Pendentes
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                {transactions.filter(t => t.status === 'COMPLETED').length} Concluídas
              </div>
            </div>
          </div>
        </div>
        
        {/* Desktop Table - Hidden on Mobile */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full min-w-full">
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
                  Taxa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
              {transactions.map(transaction => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.customer?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.customer?.document || transaction.customerId}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(transaction.exchangeRate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.status === 'COMPLETED' 
                        ? 'bg-green-100 text-green-800'
                        : transaction.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : transaction.status === 'ETHER_FAILED'
                        ? 'bg-red-100 text-red-800'
                        : transaction.status === 'MANUAL_PENDING'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {transaction.status === 'COMPLETED' 
                        ? 'Concluída'
                        : transaction.status === 'PENDING'
                        ? 'Pendente'
                        : transaction.status === 'ETHER_FAILED'
                        ? 'Falha Ether'
                        : transaction.status === 'MANUAL_PENDING'
                        ? 'Manual Pendente'
                        : 'Cancelada'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {transaction.status === 'PENDING' && (
                      <button
                        onClick={() => handleCancelTransaction(transaction.id)}
                        className="text-red-600 hover:text-red-700 font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout - Visible on Mobile */}
        <div className="lg:hidden divide-y divide-gray-200">
          {transactions.map(transaction => (
            <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {transaction.customer?.name || 'Cliente N/A'}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {transaction.customer?.document || transaction.customerId}
                      </p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.status === 'COMPLETED' 
                        ? 'bg-green-100 text-green-800'
                        : transaction.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : transaction.status === 'ETHER_FAILED'
                        ? 'bg-red-100 text-red-800'
                        : transaction.status === 'MANUAL_PENDING'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {transaction.status === 'COMPLETED' 
                        ? 'Concluída'
                        : transaction.status === 'PENDING'
                        ? 'Pendente'
                        : transaction.status === 'ETHER_FAILED'
                        ? 'Falha Ether'
                        : transaction.status === 'MANUAL_PENDING'
                        ? 'Manual Pendente'
                        : 'Cancelada'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Valor BRL</p>
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(transaction.amountBrl)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Cripto Recebida</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatNumber(transaction.amountCrypto, 6)} {transaction.cryptoCurrency}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Taxa Final</p>
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(transaction.exchangeRate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Data</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(transaction.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {transaction.status === 'PENDING' && (
                <div className="pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleCancelTransaction(transaction.id)}
                    className="w-full text-red-600 hover:text-red-700 font-medium py-2 px-4 rounded-lg hover:bg-red-50 transition-colors text-sm"
                  >
                    Cancelar Transação
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
          
        {transactions.length === 0 && (
          <div className="px-6 py-12 text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <p className="text-gray-500 font-medium">Nenhuma transação encontrada</p>
            <p className="text-gray-400 text-sm mt-1">As transações aparecerão aqui quando forem criadas</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Transactions;