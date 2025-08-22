# 🔧 Fluxo Manual de Transações - Quando Ether Falha

## 🎯 Visão Geral
Quando a API da Ether falha durante uma transação, o sistema automaticamente marca a transação para processamento manual, mantendo o valor BRL reservado e permitindo que o operador complete a transferência manualmente.

---

## 🔄 Estados das Transações

### **PENDING** 🟡
- Transação criada, aguardando chamada da Ether
- Valor BRL já debitado do cliente

### **ETHER_FAILED** 🔴
- API da Ether falhou
- Valor BRL ainda está reservado (não devolvido)
- Transação aguarda conversão para modo manual

### **MANUAL_PENDING** 🟠  
- Convertida para modo manual
- Operador precisa fazer transferência externa
- Aguarda confirmação manual

### **COMPLETED** 🟢
- Transação finalizada (automática ou manual)
- Cripto creditada no cliente

### **CANCELLED** ⚫
- Transação cancelada
- Valor BRL devolvido ao cliente

---

## 📋 Endpoints para Modo Manual

### 1. **Listar Transações com Falha na Ether**
```http
GET /transactions/ether-failed
Authorization: Bearer {token}
```

**Resposta:**
```json
[
  {
    "id": "transaction-uuid",
    "status": "ETHER_FAILED",
    "customerId": "customer-uuid",
    "customer": {
      "name": "João Silva",
      "document": "12345678901"
    },
    "amountBrl": "1000.00",
    "amountCrypto": "165.28",
    "cryptoCurrency": "USDT",
    "exchangeRate": "6.05",
    "spread": "35.00",
    "isManual": false,
    "etherError": "Connection timeout to Ether API",
    "manualConfirmedBy": null,
    "createdAt": "2025-08-22T15:30:00Z"
  }
]
```

### 2. **Listar Transações Manuais Pendentes**
```http
GET /transactions/manual-pending
Authorization: Bearer {token}
```

### 3. **Converter para Modo Manual**
```http
PATCH /transactions/{transaction-id}/convert-to-manual
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "id": "transaction-uuid",
  "status": "MANUAL_PENDING",
  "isManual": true,
  "manualConfirmedBy": "operator-user-id",
  // ... outros campos
}
```

### 4. **Confirmar Transferência Manual**
```http
PATCH /transactions/{transaction-id}/confirm-manual
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "id": "transaction-uuid",
  "status": "COMPLETED",
  "isManual": true,
  "manualConfirmedBy": "operator-user-id",
  // ... outros campos
}
```

---

## 🎨 Interface Sugerida

### **Dashboard de Transações com Problema**
```html
<div class="manual-transactions-dashboard">
  <h2>Transações Manuais</h2>
  
  <!-- Abas -->
  <div class="tabs">
    <button class="tab active" onclick="showTab('ether-failed')">
      Falhas na Ether <span class="badge" id="ether-failed-count">0</span>
    </button>
    <button class="tab" onclick="showTab('manual-pending')">
      Aguardando Confirmação <span class="badge" id="manual-pending-count">0</span>
    </button>
  </div>

  <!-- Tabela de Falhas na Ether -->
  <div id="ether-failed-tab" class="tab-content">
    <table class="transactions-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Cliente</th>
          <th>Valor BRL</th>
          <th>Cripto</th>
          <th>Erro da Ether</th>
          <th>Data</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody id="ether-failed-tbody">
        <!-- Preenchido via JavaScript -->
      </tbody>
    </table>
  </div>

  <!-- Tabela de Manuais Pendentes -->
  <div id="manual-pending-tab" class="tab-content" style="display: none;">
    <table class="transactions-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Cliente</th>
          <th>Valor BRL</th>
          <th>Cripto</th>
          <th>Convertido por</th>
          <th>Data</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody id="manual-pending-tbody">
        <!-- Preenchido via JavaScript -->
      </tbody>
    </table>
  </div>
</div>
```

### **JavaScript para Gerenciar Fluxo Manual**
```javascript
// Carregar transações com falha na Ether
async function loadEtherFailedTransactions() {
  try {
    const response = await fetch('/transactions/ether-failed', {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    
    const transactions = await response.json();
    
    const tbody = document.getElementById('ether-failed-tbody');
    tbody.innerHTML = '';
    
    transactions.forEach(transaction => {
      const row = `
        <tr>
          <td>${transaction.id.substring(0, 8)}...</td>
          <td>${transaction.customer.name}</td>
          <td>R$ ${parseFloat(transaction.amountBrl).toFixed(2)}</td>
          <td>${transaction.amountCrypto} ${transaction.cryptoCurrency}</td>
          <td class="error-text">${transaction.etherError}</td>
          <td>${new Date(transaction.createdAt).toLocaleDateString()}</td>
          <td>
            <button class="btn-primary" onclick="convertToManual('${transaction.id}')">
              Converter p/ Manual
            </button>
            <button class="btn-danger" onclick="cancelTransaction('${transaction.id}')">
              Cancelar
            </button>
          </td>
        </tr>
      `;
      tbody.innerHTML += row;
    });
    
    document.getElementById('ether-failed-count').textContent = transactions.length;
  } catch (error) {
    console.error('Erro ao carregar transações com falha:', error);
  }
}

// Carregar transações manuais pendentes
async function loadManualPendingTransactions() {
  try {
    const response = await fetch('/transactions/manual-pending', {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    
    const transactions = await response.json();
    
    const tbody = document.getElementById('manual-pending-tbody');
    tbody.innerHTML = '';
    
    transactions.forEach(transaction => {
      const row = `
        <tr>
          <td>${transaction.id.substring(0, 8)}...</td>
          <td>${transaction.customer.name}</td>
          <td>R$ ${parseFloat(transaction.amountBrl).toFixed(2)}</td>
          <td>${transaction.amountCrypto} ${transaction.cryptoCurrency}</td>
          <td>${transaction.manualConfirmedBy}</td>
          <td>${new Date(transaction.createdAt).toLocaleDateString()}</td>
          <td>
            <button class="btn-success" onclick="confirmManualTransfer('${transaction.id}')">
              Confirmar Transferência
            </button>
            <button class="btn-info" onclick="showTransactionDetails('${transaction.id}')">
              Ver Detalhes
            </button>
          </td>
        </tr>
      `;
      tbody.innerHTML += row;
    });
    
    document.getElementById('manual-pending-count').textContent = transactions.length;
  } catch (error) {
    console.error('Erro ao carregar transações manuais pendentes:', error);
  }
}

// Converter transação para modo manual
async function convertToManual(transactionId) {
  if (!confirm('Converter esta transação para modo manual? Você precisará fazer a transferência externamente.')) {
    return;
  }
  
  try {
    const response = await fetch(`/transactions/${transactionId}/convert-to-manual`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    
    if (response.ok) {
      alert('Transação convertida para modo manual!');
      loadEtherFailedTransactions();
      loadManualPendingTransactions();
    } else {
      const error = await response.json();
      alert(`Erro: ${error.message}`);
    }
  } catch (error) {
    alert(`Erro de conexão: ${error.message}`);
  }
}

// Confirmar transferência manual
async function confirmManualTransfer(transactionId) {
  if (!confirm('Confirmar que a transferência foi realizada externamente? Isso creditará a cripto no cliente.')) {
    return;
  }
  
  try {
    const response = await fetch(`/transactions/${transactionId}/confirm-manual`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    
    if (response.ok) {
      alert('Transferência confirmada! Cripto creditada no cliente.');
      loadManualPendingTransactions();
    } else {
      const error = await response.json();
      alert(`Erro: ${error.message}`);
    }
  } catch (error) {
    alert(`Erro de conexão: ${error.message}`);
  }
}

// Atualizar automaticamente a cada 30 segundos
setInterval(() => {
  loadEtherFailedTransactions();
  loadManualPendingTransactions();
}, 30000);

// Carregar dados iniciais
loadEtherFailedTransactions();
loadManualPendingTransactions();
```

---

## 🔄 Fluxo Completo

### **Cenário 1: Ether Funciona (Normal)**
```
1. Operador cria pedido → POST /transactions/buy-order
2. Sistema debita BRL do cliente
3. Sistema chama Ether API ✅
4. Webhook confirma compra
5. Sistema credita cripto no cliente
Status: PENDING → COMPLETED
```

### **Cenário 2: Ether Falha (Manual)**
```
1. Operador cria pedido → POST /transactions/buy-order
2. Sistema debita BRL do cliente
3. Sistema chama Ether API ❌ (falha)
4. Status automaticamente vira ETHER_FAILED
5. Operador converte para manual → PATCH /{id}/convert-to-manual
6. Status vira MANUAL_PENDING
7. Operador faz transferência externamente
8. Operador confirma → PATCH /{id}/confirm-manual
9. Sistema credita cripto no cliente
Status: PENDING → ETHER_FAILED → MANUAL_PENDING → COMPLETED
```

---

## ⚠️ Pontos Importantes

### **Gestão de Saldo:**
- ✅ Quando Ether falha, BRL **NÃO é devolvido**
- ✅ Valor fica **reservado** para transferência manual
- ✅ Só crédita cripto após confirmação manual
- ✅ Se cancelar, **devolve BRL** ao cliente

### **Auditoria:**
- ✅ Registra **quem** converteu para manual
- ✅ Registra **quem** confirmou a transferência
- ✅ Mantém **erro original** da Ether
- ✅ **Timestamp** de todas as operações

### **Segurança:**
- ✅ Apenas usuários autenticados podem processar
- ✅ Validações de estado em todas operações
- ✅ Logs detalhados de todas ações
- ✅ Transações atômicas garantem consistência

Este sistema garante que **nenhuma transação seja perdida** mesmo quando a Ether falha, permitindo processamento manual seguro!