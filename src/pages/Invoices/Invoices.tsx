import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { invoicesApi, customersApi } from '@/api';
import { Invoice, Customer, InvoiceStatus, Gateway } from '@/types';
import PageHeader from '@/components/PageHeader';

const Invoices: React.FC = () => {
  const { hasPermission } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [searchEndToEnd, setSearchEndToEnd] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Invoice[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState({
    status: '' as InvoiceStatus | '',
    gateway: '' as Gateway | '',
    customerId: '',
  });

  useEffect(() => {
    if (hasPermission('invoices:read')) {
      fetchInvoices();
      fetchCustomers();
    }
  }, [hasPermission, filters]);

  const fetchInvoices = async () => {
    try {
      const filterParams = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const data = await invoicesApi.getInvoices(filterParams);
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const data = await customersApi.getCustomers();
      setCustomers(data.filter(c => c.isActive));
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleSearchByEndToEnd = async () => {
    if (!searchEndToEnd.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await invoicesApi.searchByEndToEnd(searchEndToEnd);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching by end-to-end:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAssignInvoice = async () => {
    if (!selectedInvoice || !selectedCustomerId || !hasPermission('invoices:assign')) return;
    
    try {
      await invoicesApi.assignInvoice(selectedInvoice.id, selectedCustomerId);
      setShowAssignModal(false);
      setSelectedInvoice(null);
      setSelectedCustomerId('');
      fetchInvoices();
    } catch (error) {
      console.error('Error assigning invoice:', error);
    }
  };

  const handleProcessInvoice = async (invoiceId: string) => {
    if (!hasPermission('invoices:process')) return;
    if (!confirm('Tem certeza que deseja marcar esta invoice como processada?')) return;
    
    try {
      await invoicesApi.processInvoice(invoiceId);
      fetchInvoices();
    } catch (error) {
      console.error('Error processing invoice:', error);
    }
  };

  const openAssignModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowAssignModal(true);
  };

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ASSIGNED_TO_CUSTOMER':
        return 'bg-blue-100 text-blue-800';
      case 'PROCESSED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: InvoiceStatus) => {
    switch (status) {
      case 'PENDING':
        return 'Pendente';
      case 'ASSIGNED_TO_CUSTOMER':
        return 'Atribuída';
      case 'PROCESSED':
        return 'Processada';
      default:
        return status;
    }
  };

  const getGatewayColor = (gateway: Gateway) => {
    switch (gateway) {
      case 'FIREBANKING':
        return 'bg-orange-100 text-orange-800';
      case 'ETHER':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!hasPermission('invoices:read')) {
    return (
      <div className="flex-1 bg-gray-50 p-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-red-700 font-medium">Você não tem permissão para visualizar invoices.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 p-8">
      <PageHeader 
        title="Invoices"
        subtitle="Gerencie invoices e atribuições"
      />

      {/* Search by End-to-End */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Buscar por End-to-End</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={searchEndToEnd}
            onChange={(e) => setSearchEndToEnd(e.target.value)}
            placeholder="Digite o end-to-end (E2E)"
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <button
            onClick={handleSearchByEndToEnd}
            disabled={isSearching || !searchEndToEnd.trim()}
            className="px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSearching ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
        
        {searchResults.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Resultados encontrados ({searchResults.length})
            </h4>
            <div className="space-y-2">
              {searchResults.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{invoice.gatewayTransactionId}</p>
                    <p className="text-xs text-gray-500">
                      {invoice.payerInfo.name} - R$ {parseFloat(invoice.amount).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                      {getStatusText(invoice.status)}
                    </span>
                    {invoice.status === 'PENDING' && hasPermission('invoices:assign') && (
                      <button
                        onClick={() => openAssignModal(invoice)}
                        className="text-blue-600 hover:text-blue-700 text-xs font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                      >
                        Atribuir
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as InvoiceStatus | '' })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Todos os status</option>
              <option value="PENDING">Pendente</option>
              <option value="ASSIGNED_TO_CUSTOMER">Atribuída</option>
              <option value="PROCESSED">Processada</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gateway</label>
            <select
              value={filters.gateway}
              onChange={(e) => setFilters({ ...filters, gateway: e.target.value as Gateway | '' })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Todos os gateways</option>
              <option value="FIREBANKING">Firebanking</option>
              <option value="ETHER">Ether</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
            <select
              value={filters.customerId}
              onChange={(e) => setFilters({ ...filters, customerId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Todos os clientes</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Lista de Invoices</h2>
          <p className="text-sm text-gray-600">{invoices.length} invoices encontradas</p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{invoice.gatewayTransactionId}</h3>
                    <p className="text-sm text-gray-500">{invoice.payerInfo.name}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-400">
                        {invoice.payerInfo.document}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getGatewayColor(invoice.gateway)}`}>
                        {invoice.gateway}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      R$ {parseFloat(invoice.amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(invoice.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                      {getStatusText(invoice.status)}
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    {invoice.status === 'PENDING' && hasPermission('invoices:assign') && (
                      <button
                        onClick={() => openAssignModal(invoice)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        Atribuir
                      </button>
                    )}
                    {invoice.status === 'ASSIGNED_TO_CUSTOMER' && hasPermission('invoices:process') && (
                      <button
                        onClick={() => handleProcessInvoice(invoice.id)}
                        className="text-green-600 hover:text-green-700 text-sm font-medium px-3 py-1 rounded-lg hover:bg-green-50 transition-colors"
                      >
                        Processar
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {invoice.customer && (
                <div className="mt-2 ml-16 p-2 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <span className="font-medium">Cliente:</span> {invoice.customer.name}
                  </p>
                </div>
              )}
            </div>
          ))}
          {invoices.length === 0 && (
            <div className="px-6 py-8 text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500">Nenhuma invoice encontrada</p>
            </div>
          )}
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Atribuir Invoice</h3>
              <button
                onClick={() => {setShowAssignModal(false); setSelectedInvoice(null); setSelectedCustomerId('');}}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm font-medium text-gray-900">{selectedInvoice.gatewayTransactionId}</p>
              <p className="text-sm text-gray-500">{selectedInvoice.payerInfo.name}</p>
              <p className="text-sm text-gray-500">
                R$ {parseFloat(selectedInvoice.amount).toFixed(2)}
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Selecionar Cliente</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Selecione um cliente</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.document}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {setShowAssignModal(false); setSelectedInvoice(null); setSelectedCustomerId('');}}
                className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAssignInvoice}
                disabled={!selectedCustomerId}
                className="flex-1 px-4 py-3 text-sm font-medium text-white bg-orange-500 rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Atribuir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;