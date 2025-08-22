import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { webhooksApi } from '@/api';
import { Webhook, WebhookStatistics } from '@/types';
import PageHeader from '@/components/PageHeader';

const Webhooks: React.FC = () => {
  const { hasPermission } = useAuth();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [statistics, setStatistics] = useState<WebhookStatistics | null>(null);
  const [unprocessedWebhooks, setUnprocessedWebhooks] = useState<Webhook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'statistics' | 'unprocessed' | 'all'>('statistics');
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (hasPermission('webhooks:read')) {
      fetchStatistics();
      if (activeTab === 'all') {
        fetchAllWebhooks();
      } else if (activeTab === 'unprocessed') {
        fetchUnprocessedWebhooks();
      }
    }
  }, [hasPermission, activeTab]);

  const fetchStatistics = async () => {
    try {
      const data = await webhooksApi.getWebhookStatistics();
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching webhook statistics:', error);
    } finally {
      if (activeTab === 'statistics') {
        setIsLoading(false);
      }
    }
  };

  const fetchAllWebhooks = async () => {
    try {
      setIsLoading(true);
      const data = await webhooksApi.getWebhooks();
      setWebhooks(data);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnprocessedWebhooks = async () => {
    try {
      setIsLoading(true);
      const data = await webhooksApi.getUnprocessedWebhooks();
      setUnprocessedWebhooks(data);
    } catch (error) {
      console.error('Error fetching unprocessed webhooks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryWebhook = async (webhookId: string) => {
    if (!hasPermission('webhooks:retry')) return;
    if (!confirm('Tem certeza que deseja reprocessar este webhook?')) return;
    
    try {
      await webhooksApi.retryWebhook(webhookId);
      // Refresh the current view
      if (activeTab === 'unprocessed') {
        fetchUnprocessedWebhooks();
      } else if (activeTab === 'all') {
        fetchAllWebhooks();
      }
      fetchStatistics(); // Always refresh statistics
    } catch (error) {
      console.error('Error retrying webhook:', error);
    }
  };

  const openDetailModal = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setShowDetailModal(true);
  };

  const getGatewayColor = (gateway: string) => {
    switch (gateway) {
      case 'FIREBANKING':
        return 'bg-orange-100 text-orange-800';
      case 'ETHER':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!hasPermission('webhooks:read')) {
    return (
      <div className="flex-1 bg-gray-50 p-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-red-700 font-medium">Você não tem permissão para visualizar webhooks.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 p-8">
      <PageHeader 
        title="Webhooks"
        subtitle="Monitoramento e gerenciamento de webhooks"
      />

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('statistics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'statistics'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Estatísticas
            </button>
            <button
              onClick={() => setActiveTab('unprocessed')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'unprocessed'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Não Processados {statistics?.unprocessed ? `(${statistics.unprocessed})` : ''}
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Todos os Webhooks
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'statistics' && (
            <div>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : statistics ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Visão Geral dos Webhooks</h3>
                  
                  {/* Statistics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-blue-50 rounded-xl p-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-blue-600">Total</p>
                          <p className="text-2xl font-bold text-blue-900">{statistics.total}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-xl p-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-green-600">Processados</p>
                          <p className="text-2xl font-bold text-green-900">{statistics.processed}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-red-50 rounded-xl p-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-red-600">Não Processados</p>
                          <p className="text-2xl font-bold text-red-900">{statistics.unprocessed}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* By Gateway */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Webhooks por Gateway</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {statistics.byGateway.map((gateway, index) => (
                        <div key={index} className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium text-gray-900">{gateway.gateway}</h5>
                              <p className="text-sm text-gray-500">{gateway.count} webhooks</p>
                            </div>
                            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getGatewayColor(gateway.gateway)}`}>
                              {gateway.gateway}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Erro ao carregar estatísticas</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'unprocessed' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Webhooks Não Processados</h3>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : unprocessedWebhooks.length > 0 ? (
                <div className="space-y-4">
                  {unprocessedWebhooks.map((webhook) => (
                    <div key={webhook.id} className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Webhook {webhook.id.slice(0, 8)}</h4>
                          <p className="text-sm text-gray-500">
                            Gateway: {webhook.gateway} | {new Date(webhook.createdAt).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            Não Processado
                          </span>
                          <button
                            onClick={() => openDetailModal(webhook)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                          >
                            Detalhes
                          </button>
                          {hasPermission('webhooks:retry') && (
                            <button
                              onClick={() => handleRetryWebhook(webhook.id)}
                              className="text-orange-600 hover:text-orange-700 text-sm font-medium px-2 py-1 rounded hover:bg-orange-50 transition-colors"
                            >
                              Reprocessar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-gray-500">Todos os webhooks foram processados!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'all' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Todos os Webhooks</h3>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : webhooks.length > 0 ? (
                <div className="space-y-4">
                  {webhooks.map((webhook) => (
                    <div key={webhook.id} className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Webhook {webhook.id.slice(0, 8)}</h4>
                          <p className="text-sm text-gray-500">
                            Gateway: {webhook.gateway} | {new Date(webhook.createdAt).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            webhook.processed 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {webhook.processed ? 'Processado' : 'Não Processado'}
                          </span>
                          <button
                            onClick={() => openDetailModal(webhook)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                          >
                            Detalhes
                          </button>
                          {!webhook.processed && hasPermission('webhooks:retry') && (
                            <button
                              onClick={() => handleRetryWebhook(webhook.id)}
                              className="text-orange-600 hover:text-orange-700 text-sm font-medium px-2 py-1 rounded hover:bg-orange-50 transition-colors"
                            >
                              Reprocessar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <p className="text-gray-500">Nenhum webhook encontrado</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedWebhook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Detalhes do Webhook</h3>
              <button
                onClick={() => {setShowDetailModal(false); setSelectedWebhook(null);}}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">ID</label>
                <p className="mt-1 text-sm text-gray-900 bg-gray-50 rounded p-2">{selectedWebhook.id}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Gateway</label>
                <span className={`inline-flex px-2 py-1 text-sm font-medium rounded-full ${getGatewayColor(selectedWebhook.gateway)}`}>
                  {selectedWebhook.gateway}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-flex px-2 py-1 text-sm font-medium rounded-full ${
                  selectedWebhook.processed 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {selectedWebhook.processed ? 'Processado' : 'Não Processado'}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Data de Criação</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedWebhook.createdAt).toLocaleString('pt-BR')}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Payload</label>
                <pre className="mt-1 text-xs text-gray-900 bg-gray-50 rounded p-3 overflow-x-auto">
                  {JSON.stringify(selectedWebhook.payload, null, 2)}
                </pre>
              </div>
            </div>
            
            <div className="flex gap-3 pt-6">
              <button
                onClick={() => {setShowDetailModal(false); setSelectedWebhook(null);}}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Fechar
              </button>
              {!selectedWebhook.processed && hasPermission('webhooks:retry') && (
                <button
                  onClick={() => {
                    handleRetryWebhook(selectedWebhook.id);
                    setShowDetailModal(false);
                    setSelectedWebhook(null);
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-xl hover:bg-orange-600 transition-colors"
                >
                  Reprocessar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Webhooks;