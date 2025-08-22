// Formatadores de valor e máscaras
export const formatCurrency = (value: string | number): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
};

export const formatNumber = (value: string | number, decimals: number = 2): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(numValue);
};

export const parseCurrency = (value: string): string => {
  // Remove todos os caracteres exceto números, vírgula e ponto
  const cleaned = value.replace(/[^\d.,]/g, '');
  
  // Substitui vírgula por ponto para número decimal
  const withDot = cleaned.replace(',', '.');
  
  // Remove pontos extras (mantém apenas o último)
  const parts = withDot.split('.');
  if (parts.length > 2) {
    const integerPart = parts.slice(0, -1).join('');
    const decimalPart = parts[parts.length - 1];
    return `${integerPart}.${decimalPart}`;
  }
  
  return withDot;
};

export const maskCurrency = (value: string): string => {
  // Remove tudo exceto números
  const numbers = value.replace(/\D/g, '');
  
  // Se não há números, retorna vazio
  if (!numbers) return '';
  
  // Converte para centavos
  const cents = parseInt(numbers, 10);
  
  // Converte centavos para reais
  const reais = cents / 100;
  
  // Formata como moeda brasileira
  return reais.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const unmaskCurrency = (value: string): string => {
  // Remove formatação e retorna apenas números com ponto decimal
  const cleaned = value.replace(/\./g, '').replace(',', '.');
  const parsed = parseFloat(cleaned) || 0;
  return parsed.toString();
};

export const maskPercentage = (value: string): string => {
  // Remove tudo exceto números e vírgula/ponto
  const cleaned = value.replace(/[^\d.,]/g, '');
  
  // Substitui vírgula por ponto
  const withDot = cleaned.replace(',', '.');
  
  // Limita casas decimais
  const parts = withDot.split('.');
  if (parts.length > 1) {
    parts[1] = parts[1].substring(0, 2); // máximo 2 casas decimais
    return parts.join('.');
  }
  
  return withDot;
};