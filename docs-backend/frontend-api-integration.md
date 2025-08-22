# API de Integração - Frontend

## Visão Geral

Esta documentação descreve a API REST do sistema Mesa OTC para integração com o frontend. Todos os endpoints (exceto webhooks e login) requerem autenticação JWT.

**Base URL:** `http://localhost:3000` (desenvolvimento)

## Autenticação

### Configuração de Headers

Todos os endpoints autenticados devem incluir o header:
```
Authorization: Bearer <jwt_token>
```

### Login

**POST** `/auth/login`

```json
{
  "email": "admin@example.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@example.com", 
    "name": "Admin User",
    "role": "ADMIN",
    "permissions": ["users:create", "users:read", ...]
  }
}
```

### Perfil do Usuário

**GET** `/auth/profile`

**Response:**
```json
{
  "id": "uuid",
  "email": "admin@example.com",
  "name": "Admin User", 
  "role": "ADMIN",
  "permissions": ["users:create", "users:read", ...]
}
```

### Renovar Token

**POST** `/auth/refresh`

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Gerenciamento de Usuários

### Listar Usuários

**GET** `/users`

**Permissions:** `users:read`  
**Roles:** `ADMIN`, `AUDITOR`

**Response:**
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "isActive": true,
    "role": {
      "name": "OPERATOR",
      "permissions": [...]
    },
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### Criar Usuário

**POST** `/users`

**Permissions:** `users:create`  
**Roles:** `ADMIN`

```json
{
  "email": "newuser@example.com",
  "password": "senha123",
  "name": "New User",
  "roleId": "role-uuid",
  "isActive": true
}
```

### Atualizar Usuário

**PATCH** `/users/:id`

**Permissions:** `users:update`  
**Roles:** `ADMIN`

```json
{
  "name": "Updated Name",
  "isActive": false
}
```

### Excluir Usuário

**DELETE** `/users/:id`

**Permissions:** `users:delete`  
**Roles:** `ADMIN`

## Gerenciamento de Clientes

### Listar Clientes

**GET** `/customers`

**Permissions:** `customers:read`

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Cliente Nome",
    "document": "12345678901",
    "email": "cliente@example.com",
    "phone": "+5511999999999",
    "isActive": true,
    "balances": [
      {
        "id": "uuid",
        "currency": "BRL",
        "balance": "1000.50000000",
        "updatedAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### Criar Cliente

**POST** `/customers`

**Permissions:** `customers:create`

```json
{
  "name": "Novo Cliente",
  "document": "12345678901",
  "email": "cliente@example.com",
  "phone": "+5511999999999",
  "isActive": true
}
```

### Obter Saldo do Cliente

**GET** `/customers/:id/balance/:currency`

**Response:**
```json
"1500.25000000"
```

### Atualizar Saldo do Cliente

**PATCH** `/customers/:id/balance/:currency`

```json
{
  "amount": "100.50"
}
```

**Response:**
```json
{
  "id": "uuid",
  "customerId": "customer-uuid",
  "currency": "BRL", 
  "balance": "1600.75000000",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

## Gerenciamento de Invoices

### Listar Invoices

**GET** `/invoices`

**Permissions:** `invoices:read`

**Query Parameters:**
- `status`: `PENDING` | `ASSIGNED_TO_CUSTOMER` | `PROCESSED`
- `gateway`: `FIREBANKING` | `ETHER`
- `customerId`: UUID do cliente
- `startDate`: Data início (ISO string)
- `endDate`: Data fim (ISO string)

**Response:**
```json
[
  {
    "id": "uuid",
    "status": "PENDING",
    "gatewayTransactionId": "tx_123456",
    "endToEnd": "E12345678901234567890123456789012",
    "gateway": "FIREBANKING",
    "amount": "500.00000000",
    "payerInfo": {
      "name": "João Silva",
      "document": "12345678901"
    },
    "webhookId": "webhook-uuid",
    "customerId": null,
    "customer": null,
    "webhook": {
      "id": "webhook-uuid",
      "gateway": "FIREBANKING",
      "processed": true,
      "createdAt": "2025-01-01T00:00:00.000Z"
    },
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### Listar Invoices Pendentes

**GET** `/invoices/pending`

**Permissions:** `invoices:read`

### Buscar Invoice por End-to-End

**GET** `/invoices/search/end-to-end/:endToEnd`

**Permissions:** `invoices:read`

**Response:** Array de invoices que batem com o E2E

### Invoices do Cliente

**GET** `/invoices/customer/:customerId`

**Permissions:** `invoices:read`

### Atribuir Invoice a Cliente

**PATCH** `/invoices/:id/assign`

**Permissions:** `invoices:assign`  
**Roles:** `ADMIN`, `OPERATOR`

```json
{
  "customerId": "customer-uuid"
}
```

**Response:** Invoice atualizada com status `ASSIGNED_TO_CUSTOMER`

### Marcar Invoice como Processada

**PATCH** `/invoices/:id/process`

**Permissions:** `invoices:process`  
**Roles:** `ADMIN`, `OPERATOR`

**Response:** Invoice com status `PROCESSED`

## Webhooks (Administrativo)

### Listar Webhooks

**GET** `/webhooks`

**Permissions:** `webhooks:read`  
**Roles:** `ADMIN`, `AUDITOR`

**Response:**
```json
[
  {
    "id": "uuid",
    "gateway": "FIREBANKING",
    "payload": {
      "event": "payment_received",
      "transaction_id": "tx_123456",
      "amount": 500.00,
      "payer": {
        "name": "João Silva",
        "document": "12345678901"
      }
    },
    "processed": true,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### Estatísticas de Webhooks

**GET** `/webhooks/statistics`

**Permissions:** `webhooks:read`  
**Roles:** `ADMIN`, `AUDITOR`

**Response:**
```json
{
  "total": 150,
  "processed": 145,
  "unprocessed": 5,
  "byGateway": [
    { "gateway": "FIREBANKING", "count": "100" },
    { "gateway": "ETHER", "count": "50" }
  ]
}
```

### Webhooks Não Processados

**GET** `/webhooks/unprocessed`

**Permissions:** `webhooks:read`  
**Roles:** `ADMIN`, `OPERATOR`

### Reprocessar Webhook

**POST** `/webhooks/:id/retry`

**Permissions:** `webhooks:retry`  
**Roles:** `ADMIN`, `OPERATOR`

## Tratamento de Erros

### Códigos de Status

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Bad Request (dados inválidos)
- `401` - Não autenticado
- `403` - Não autorizado (sem permissão)
- `404` - Não encontrado
- `409` - Conflito (ex: email já existe)
- `500` - Erro interno

### Formato de Erro

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "must be a valid email"
    }
  ]
}
```

## Fluxos de Integração

### 1. Fluxo de Login

```javascript
// 1. Fazer login
const loginResponse = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { access_token, user } = await loginResponse.json();

// 2. Salvar token (localStorage, context, etc)
localStorage.setItem('token', access_token);

// 3. Configurar header para próximas requisições
const authHeader = { 'Authorization': `Bearer ${access_token}` };
```

### 2. Fluxo de Atribuição de Invoice

```javascript
// 1. Listar invoices pendentes
const pendingInvoices = await fetch('/invoices/pending', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

// 2. Operador seleciona invoice e cliente
const invoiceId = 'selected-invoice-id';
const customerId = 'selected-customer-id';

// 3. Atribuir invoice ao cliente
const assignedInvoice = await fetch(`/invoices/${invoiceId}/assign`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ customerId })
}).then(r => r.json());

// 4. Invoice agora está com status ASSIGNED_TO_CUSTOMER
// 5. Saldo do cliente foi atualizado automaticamente
```

### 3. Fluxo de Busca por Comprovante

```javascript
// 1. Operador faz upload do comprovante (módulo file-processing)
// 2. OCR extrai o end-to-end
const extractedE2E = 'E12345678901234567890123456789012';

// 3. Buscar invoices com esse E2E
const matchingInvoices = await fetch(`/invoices/search/end-to-end/${extractedE2E}`, {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

// 4. Se encontrar match, operador pode atribuir ao cliente
```

### 4. Dashboard - Dados em Tempo Real

```javascript
// Dados para dashboard
const dashboardData = await Promise.all([
  // Estatísticas de webhooks
  fetch('/webhooks/statistics', { headers: authHeaders }).then(r => r.json()),
  
  // Invoices pendentes
  fetch('/invoices/pending', { headers: authHeaders }).then(r => r.json()),
  
  // Webhooks não processados
  fetch('/webhooks/unprocessed', { headers: authHeaders }).then(r => r.json()),
  
  // Clientes ativos
  fetch('/customers', { headers: authHeaders }).then(r => r.json())
]);

const [webhookStats, pendingInvoices, failedWebhooks, customers] = dashboardData;
```

## Tipos TypeScript

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

interface Role {
  id: string;
  name: 'ADMIN' | 'OPERATOR' | 'AUDITOR';
  permissions: string[];
}

interface Customer {
  id: string;
  name: string;
  document: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  balances: CustomerBalance[];
  createdAt: string;
  updatedAt: string;
}

interface CustomerBalance {
  id: string;
  customerId: string;
  currency: string;
  balance: string; // BigNumber as string
  updatedAt: string;
}

interface Invoice {
  id: string;
  status: 'PENDING' | 'ASSIGNED_TO_CUSTOMER' | 'PROCESSED';
  gatewayTransactionId: string;
  endToEnd?: string;
  gateway: 'FIREBANKING' | 'ETHER';
  amount: string; // BigNumber as string
  payerInfo: {
    name: string;
    document: string;
  };
  webhookId: string;
  customerId?: string;
  customer?: Customer;
  webhook: Webhook;
  createdAt: string;
  updatedAt: string;
}

interface Webhook {
  id: string;
  gateway: 'FIREBANKING' | 'ETHER';
  payload: any;
  processed: boolean;
  createdAt: string;
}
```

## Considerações de Performance

### Paginação
Para endpoints com muitos dados, considere implementar paginação:
```
GET /invoices?page=1&limit=20&sort=createdAt:desc
```

### Cache
- Dados de usuário logado: cache local
- Lista de clientes: cache com invalidação
- Estatísticas: refresh periódico

### WebSocket (Futuro)
Para updates em tempo real:
- Novos webhooks/invoices
- Status de processamento
- Notificações