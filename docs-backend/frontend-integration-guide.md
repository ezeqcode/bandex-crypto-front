# 📱 Guia de Integração Frontend - Sistema OTC Cripto

## 🔗 Base URL
```
http://15.204.245.110:4018
```

## 📋 Índice
1. [Autenticação](#autenticação)
2. [Gestão de Clientes](#gestão-de-clientes)
3. [Gestão de Invoices](#gestão-de-invoices)
4. [Sistema de Conversão](#sistema-de-conversão)
5. [Webhooks](#webhooks)
6. [Fluxos Completos](#fluxos-completos)

---

## 🔐 Autenticação

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "ADMIN"
  }
}
```

### Headers de Autorização
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 👥 Gestão de Clientes

### Listar Clientes
```http
GET /customers
Authorization: Bearer {token}
```

**Resposta:**
```json
[
  {
    "id": "customer-uuid",
    "name": "João Silva",
    "document": "12345678901",
    "email": "joao@email.com",
    "phone": "+5511999999999",
    "isActive": true,
    "balances": [
      {
        "currency": "BRL",
        "balance": "1500.00"
      },
      {
        "currency": "USDT", 
        "balance": "275.50"
      }
    ],
    "createdAt": "2025-01-15T10:30:00Z"
  }
]
```

### Criar Cliente
```http
POST /customers
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Maria Santos",
  "document": "98765432100",
  "email": "maria@email.com",
  "phone": "+5511888888888"
}
```

### Buscar Cliente por ID
```http
GET /customers/{customer-id}
Authorization: Bearer {token}
```

### Consultar Saldo Específico
```http
GET /customers/{customer-id}/balance/{currency}
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "customerId": "customer-uuid",
  "currency": "BRL",
  "balance": "1500.00"
}
```

---

## 📄 Gestão de Invoices

### Listar Invoices
```http
GET /invoices
Authorization: Bearer {token}
```

**Resposta:**
```json
[
  {
    "id": "invoice-uuid",
    "status": "PENDING",
    "gatewayTransactionId": "9909913a-03f8-4c3e-a7b4-0caf68953606",
    "endToEnd": "E22896431202508221233CND6rcBIP6O",
    "gateway": "FIREBANKING", 
    "amount": "35.00",
    "payerInfo": {
      "name": "Jose Oliveira Rodrigues",
      "document": "32253206172"
    },
    "customerId": null,
    "customer": null,
    "createdAt": "2025-08-22T12:34:14Z"
  }
]
```

### Buscar Invoices Pendentes
```http
GET /invoices/pending
Authorization: Bearer {token}
```

### Atribuir Invoice a Cliente
```http
PATCH /invoices/{invoice-id}/assign
Authorization: Bearer {token}
Content-Type: application/json

{
  "customerId": "customer-uuid"
}
```

### Processar Invoice (Aumentar Saldo)
```http
PATCH /invoices/{invoice-id}/process
Authorization: Bearer {token}
```

**⚠️ Importante:** Este endpoint aumenta automaticamente o saldo BRL do cliente!

---

## 💱 Sistema de Conversão (BRL → Cripto)

### Criar Pedido de Compra
```http
POST /transactions/buy-order
Authorization: Bearer {token}
Content-Type: application/json

{
  "customerId": "customer-uuid",
  "amountBrl": "1000.00",           // Valor em BRL que o cliente quer converter
  "marketRate": "5.50",             // Cotação atual (1 USDT = 5.50 BRL)
  "cryptoCurrency": "USDT",         // Cripto desejada
  "spreadPercentage": 2.5,          // Spread em % (nosso lucro)
  "feePercentage": 1.0              // Taxa adicional em %
}
```

**Resposta:**
```json
{
  "id": "transaction-uuid",
  "status": "PENDING",
  "customerId": "customer-uuid", 
  "type": "BUY",
  "amountBrl": "1000.00",           // Valor debitado do cliente
  "amountCrypto": "165.28",         // USDT que o cliente receberá
  "cryptoCurrency": "USDT",
  "exchangeRate": "6.05",           // Taxa final aplicada
  "spread": "35.00",                // Nosso lucro em BRL
  "createdAt": "2025-08-22T15:30:00Z"
}
```

### Listar Transações
```http
GET /transactions
Authorization: Bearer {token}
```

### Transações de um Cliente
```http
GET /transactions/customer/{customer-id}
Authorization: Bearer {token}
```

### Cancelar Transação (somente PENDING)
```http
PATCH /transactions/{transaction-id}/cancel
Authorization: Bearer {token}
```

**⚠️ Importante:** Devolve o BRL ao cliente automaticamente!

---

## 📡 Webhooks

### Webhook da Firebanking (Depósitos)
```http
POST /webhooks
Content-Type: application/json

{
  "gateway": "FIREBANKING",
  "payload": {
    "transactionId": "9909913a-03f8-4c3e-a7b4-0caf68953606",
    "status": "PAID",
    "value": 35,
    "endToEndId": "E22896431202508221233CND6rcBIP6O",
    "PayerName": "Jose Oliveira Rodrigues",
    "PayerDocumentNumber": "32253206172"
  }
}
```

### Webhook da Ether (Confirmações de Compra)
```http
POST /webhooks
Content-Type: application/json

{
  "gateway": "ETHER",
  "payload": {
    "type": "buy_confirmed",
    "transactionId": "nossa-transaction-uuid",
    "etherTxId": "ether-transaction-id",
    "amount": "165.28",
    "currency": "USDT"
  }
}
```

---

## 🔄 Fluxos Completos

### 1. **Fluxo de Depósito (Invoice)**
```mermaid
Cliente → Webhook → Invoice PENDING → Operador atribui → Saldo BRL aumenta
```

**Passos no Frontend:**
1. Lista invoices pendentes: `GET /invoices/pending`
2. Operador seleciona cliente e atribui: `PATCH /invoices/{id}/assign`
3. Processa invoice: `PATCH /invoices/{id}/process`
4. Saldo BRL do cliente é automaticamente aumentado

### 2. **Fluxo de Conversão (BRL → Cripto)**
```mermaid
Operador cria pedido → Sistema debita BRL → Chama Ether → Webhook confirma → Credita cripto
```

**Passos no Frontend:**
1. Consulta saldo do cliente: `GET /customers/{id}`
2. Operador define valores e spread: Interface de conversão
3. Cria pedido: `POST /transactions/buy-order`
4. Sistema automaticamente:
   - Debita BRL do cliente
   - Chama API da Ether
   - Aguarda confirmação via webhook
   - Credita cripto no cliente

### 3. **Interface Sugerida para Conversão**

```html
<!-- Formulário de Conversão -->
<form>
  <select name="customer">Cliente</select>
  <input name="amountBrl" placeholder="Valor em BRL">
  <input name="marketRate" placeholder="Cotação (ex: 5.50)">
  <select name="cryptoCurrency">
    <option>USDT</option>
    <option>BTC</option>
    <option>ETH</option>
  </select>
  <input name="spreadPercentage" placeholder="Spread % (ex: 2.5)">
  <input name="feePercentage" placeholder="Taxa % (ex: 1.0)">
  
  <!-- Cálculos em Tempo Real -->
  <div class="preview">
    <p>Cliente receberá: <span id="cryptoAmount">0 USDT</span></p>
    <p>Nosso lucro: <span id="profit">R$ 0</span></p>
    <p>Taxa final: <span id="finalRate">R$ 0/USDT</span></p>
  </div>
  
  <button type="submit">Criar Pedido</button>
</form>
```

---

## ⚡ Estados e Status

### Status de Invoice
- `PENDING`: Aguardando atribuição
- `ASSIGNED_TO_CUSTOMER`: Atribuída, aguardando processamento  
- `PROCESSED`: Processada, saldo creditado

### Status de Transaction
- `PENDING`: Aguardando confirmação da Ether
- `COMPLETED`: Concluída, cripto creditada
- `CANCELLED`: Cancelada, BRL devolvido

---

## 🛡️ Tratamento de Erros

### Códigos Comuns
- `400 Bad Request`: Dados inválidos
- `401 Unauthorized`: Token inválido/expirado
- `404 Not Found`: Recurso não encontrado
- `409 Conflict`: Saldo insuficiente

### Exemplo de Erro
```json
{
  "statusCode": 400,
  "message": "Saldo insuficiente. Disponível: 500.00 BRL, Solicitado: 1000.00 BRL",
  "error": "Bad Request"
}
```

---

## 📊 Exemplo de Dashboard

### Métricas Sugeridas
```http
GET /customers                    # Total de clientes ativos
GET /invoices/pending            # Invoices aguardando
GET /transactions?status=PENDING # Conversões pendentes
```

### Cards do Dashboard
- **Clientes Ativos**: Quantidade total
- **Invoices Pendentes**: Aguardando atribuição
- **Conversões Hoje**: Volume do dia
- **Lucro do Mês**: Soma dos spreads

Esta documentação cobre todos os endpoints necessários para uma integração completa do frontend com o sistema OTC!