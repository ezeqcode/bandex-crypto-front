# 📈 API de Cotações - Documentação Frontend

## 🔗 Base URL
```
http://15.204.245.110:4018/quotes
```

## 📋 Endpoints Disponíveis

### 1. **Buscar Todas as Cotações**
```http
GET /quotes
Authorization: Bearer {token}
```

**Resposta:**
```json
[
  {
    "id": 1,
    "name": "Tether USD",
    "symbol": "USDT",
    "networks": ["ERC20", "TRC20", "Polygon", "Optimism", "Solana"],
    "image": "https://assets.etherglobal.com/usdt.png",
    "decimals": 6,
    "price": 5.52,
    "canDeposit": true,
    "canWithdraw": true,
    "fee": "0.57",
    "minDeposit": "10.00",
    "minWithdraw": "20.00"
  },
  {
    "id": 2,
    "name": "Bitcoin",
    "symbol": "BTC",
    "networks": ["Bitcoin"],
    "image": "https://assets.etherglobal.com/btc.png",
    "decimals": 8,
    "price": 582450.75,
    "canDeposit": true,
    "canWithdraw": true,
    "fee": "0.00002",
    "minDeposit": "0.001",
    "minWithdraw": "0.002"
  },
  {
    "id": 3,
    "name": "Ethereum",
    "symbol": "ETH",
    "networks": ["ERC20", "Base", "Optimism"],
    "image": "https://assets.etherglobal.com/eth.png",
    "decimals": 18,
    "price": 23850.90,
    "canDeposit": true,
    "canWithdraw": true,
    "fee": "0.00008",
    "minDeposit": "0.01",
    "minWithdraw": "0.02"
  }
]
```

---

### 2. **Buscar Cotação por Moeda**
```http
GET /quotes/{symbol}
Authorization: Bearer {token}
```

**Exemplo:**
```http
GET /quotes/USDT
```

**Resposta:**
```json
{
  "id": 1,
  "name": "Tether USD",
  "symbol": "USDT",
  "networks": ["ERC20", "TRC20", "Polygon", "Optimism", "Solana"],
  "image": "https://assets.etherglobal.com/usdt.png",
  "decimals": 6,
  "price": 5.52,
  "canDeposit": true,
  "canWithdraw": true,
  "fee": "0.57",
  "minDeposit": "10.00",
  "minWithdraw": "20.00"
}
```

---

### 3. **Buscar Cotação Formatada**
```http
GET /quotes/{symbol}/formatted
Authorization: Bearer {token}
```

**Exemplo:**
```http
GET /quotes/USDT/formatted
```

**Resposta:**
```json
{
  "symbol": "USDT",
  "name": "Tether USD",
  "price": 5.52,
  "priceFormatted": "R$ 5,52",
  "networks": ["ERC20", "TRC20", "Polygon", "Optimism", "Solana"],
  "canDeposit": true,
  "canWithdraw": true,
  "minDeposit": "10.00",
  "minWithdraw": "20.00",
  "fees": [
    {
      "network": "USDT-ERC20",
      "networkFullName": "Rede Ethereum (USDT)",
      "time": "≈ 5 min",
      "fee": "0.57 USDT",
      "feeUsd": 0.57,
      "feeBrl": 3.14
    },
    {
      "network": "USDT-TRC20",
      "networkFullName": "Rede Tron (USDT)",
      "time": "≈ 5 min",
      "fee": "2.3 USDT",
      "feeUsd": 2.3,
      "feeBrl": 12.65
    }
  ]
}
```

---

### 4. **Buscar Moedas Suportadas**
```http
GET /quotes/supported
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "coins": ["BTC", "ETH", "USDT", "USDC"]
}
```

---

### 5. **Buscar Taxas de Rede**
```http
GET /quotes/network-fees
Authorization: Bearer {token}
```

**Resposta:**
```json
[
  {
    "network": "BTC-Bitcoin",
    "networkFullName": "Rede Bitcoin (BTC)",
    "time": "≈ 5 min",
    "fee": "0.00002 BTC",
    "feeUsd": 2.26,
    "feeBrl": 12.45
  },
  {
    "network": "USDT-ERC20",
    "networkFullName": "Rede Ethereum (USDT)",
    "time": "≈ 5 min",
    "fee": "0.57 USDT",
    "feeUsd": 0.57,
    "feeBrl": 3.14
  }
]
```

### 6. **Buscar Taxas por Moeda Específica**
```http
GET /quotes/network-fees?symbol=USDT
Authorization: Bearer {token}
```

**Resposta:**
```json
[
  {
    "network": "USDT-Polygon",
    "networkFullName": "Rede Polygon (USDT)",
    "time": "≈ 5 min",
    "fee": "0.8 USDT",
    "feeUsd": 0.8,
    "feeBrl": 4.4
  },
  {
    "network": "USDT-TRC20",
    "networkFullName": "Rede Tron (USDT)",
    "time": "≈ 5 min",
    "fee": "2.3 USDT",
    "feeUsd": 2.3,
    "feeBrl": 12.65
  },
  {
    "network": "USDT-ERC20",
    "networkFullName": "Rede Ethereum (USDT)",
    "time": "≈ 5 min",
    "fee": "0.57 USDT",
    "feeUsd": 0.57,
    "feeBrl": 3.14
  }
]
```

---

## 🎨 Exemplos de Uso no Frontend

### **1. Buscar Cotação para Conversão**
```javascript
async function fetchQuoteForConversion(symbol) {
  try {
    const response = await fetch(`/quotes/${symbol}/formatted`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    const quote = await response.json();
    
    // Atualizar interface
    document.getElementById('market-rate').value = quote.price;
    document.getElementById('price-display').textContent = quote.priceFormatted;
    
    return quote;
  } catch (error) {
    console.error('Erro ao buscar cotação:', error);
  }
}

// Uso na interface de conversão
fetchQuoteForConversion('USDT');
```

### **2. Lista de Cotações em Tempo Real**
```javascript
async function loadQuotesTable() {
  try {
    const response = await fetch('/quotes', {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    const quotes = await response.json();
    
    const tableBody = document.getElementById('quotes-table-body');
    tableBody.innerHTML = '';
    
    quotes.forEach(quote => {
      const row = `
        <tr>
          <td>
            <img src="${quote.image}" width="24" height="24">
            ${quote.symbol}
          </td>
          <td>${quote.name}</td>
          <td>R$ ${quote.price.toFixed(2)}</td>
          <td>
            <span class="status ${quote.canDeposit ? 'active' : 'inactive'}">
              ${quote.canDeposit ? 'Ativo' : 'Inativo'}
            </span>
          </td>
          <td>
            <button onclick="startConversion('${quote.symbol}')">
              Converter
            </button>
          </td>
        </tr>
      `;
      tableBody.innerHTML += row;
    });
  } catch (error) {
    console.error('Erro ao carregar cotações:', error);
  }
}

// Atualizar cotações a cada 30 segundos
setInterval(loadQuotesTable, 30000);
```

### **3. Componente de Seleção de Moeda**
```html
<div class="crypto-selector">
  <label>Criptomoeda:</label>
  <select id="crypto-select" onchange="updateQuote()">
    <option value="">Selecione...</option>
    <!-- Preenchido dinamicamente -->
  </select>
  
  <div class="quote-info" id="quote-info" style="display: none;">
    <div class="price">
      <span>Cotação:</span>
      <strong id="current-price">R$ 0,00</strong>
    </div>
    <div class="networks">
      <span>Redes:</span>
      <span id="available-networks"></span>
    </div>
  </div>
</div>

<script>
async function loadSupportedCoins() {
  const response = await fetch('/quotes/supported', {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  
  const { coins } = await response.json();
  const select = document.getElementById('crypto-select');
  
  coins.forEach(coin => {
    const option = document.createElement('option');
    option.value = coin;
    option.textContent = coin;
    select.appendChild(option);
  });
}

async function updateQuote() {
  const symbol = document.getElementById('crypto-select').value;
  if (!symbol) return;
  
  const quote = await fetchQuoteForConversion(symbol);
  
  document.getElementById('current-price').textContent = quote.priceFormatted;
  document.getElementById('available-networks').textContent = quote.networks.join(', ');
  document.getElementById('quote-info').style.display = 'block';
}

// Inicializar
loadSupportedCoins();
</script>
```

### **4. Widget de Cotação em Tempo Real**
```html
<div class="quote-widget">
  <h3>Cotações em Tempo Real</h3>
  <div id="quotes-container">
    <!-- Preenchido dinamicamente -->
  </div>
  <small>Atualizado a cada 30 segundos</small>
</div>

<script>
async function updateQuotesWidget() {
  const quotes = await fetch('/quotes', {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  }).then(r => r.json());
  
  const container = document.getElementById('quotes-container');
  container.innerHTML = '';
  
  quotes.forEach(quote => {
    const widget = document.createElement('div');
    widget.className = 'quote-item';
    widget.innerHTML = `
      <div class="coin">
        <img src="${quote.image}" width="20" height="20">
        <span>${quote.symbol}</span>
      </div>
      <div class="price">R$ ${quote.price.toFixed(2)}</div>
    `;
    container.appendChild(widget);
  });
}

// Auto-atualizar
setInterval(updateQuotesWidget, 30000);
updateQuotesWidget(); // Primeira carga
</script>
```

---

## ⚡ Tratamento de Erros

### **Moeda não suportada:**
```json
{
  "statusCode": 400,
  "message": "Moeda DOGE não suportada. Use: BTC, ETH, USDT, USDC",
  "error": "Bad Request"
}
```

### **Cotação não encontrada:**
```json
{
  "statusCode": 400,
  "message": "Cotação não encontrada para INVALID",
  "error": "Bad Request"
}
```

### **Erro de conexão com Ether:**
```json
{
  "statusCode": 400,
  "message": "Erro ao buscar cotações: Não foi possível buscar as cotações",
  "error": "Bad Request"
}
```

---

## 🔄 Integração com Conversões

### **Fluxo Completo:**
1. **Buscar cotação atual:** `GET /quotes/USDT/formatted`
2. **Preencher automaticamente** o campo `marketRate` no formulário
3. **Criar conversão:** `POST /transactions/buy-order`
4. **Monitorar status** da transação

### **Exemplo Integrado:**
```javascript
async function startConversion(symbol) {
  // 1. Buscar cotação atual
  const quote = await fetchQuoteForConversion(symbol);
  
  // 2. Preencher formulário
  document.getElementById('crypto-currency').value = symbol;
  document.getElementById('market-rate').value = quote.price;
  
  // 3. Calcular valores
  calculateConversion();
  
  // 4. Abrir modal de conversão
  document.getElementById('conversion-modal').style.display = 'block';
}
```

Agora o frontend tem acesso completo às cotações via API HTTP, permitindo integração total com o sistema de conversões!