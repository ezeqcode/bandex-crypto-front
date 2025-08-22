import React, { useState, useCallback, useEffect } from 'react';
import { maskCurrency, unmaskCurrency, maskPercentage } from '@/utils/formatters';

interface MaskedInputProps {
  type: 'currency' | 'percentage' | 'number';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  prefix?: string;
  suffix?: string;
  disabled?: boolean;
  required?: boolean;
}

const MaskedInput: React.FC<MaskedInputProps> = ({
  type,
  value,
  onChange,
  placeholder,
  className = '',
  prefix,
  suffix,
  disabled = false,
  required = false
}) => {
  const [displayValue, setDisplayValue] = useState(() => {
    if (type === 'currency' && value) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        return numValue.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
      }
    }
    return value;
  });

  // Sincroniza displayValue quando value prop muda externamente
  useEffect(() => {
    if (type === 'currency' && value) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        // maskCurrency espera valor em centavos, então multiplicamos por 100
        const formatted = numValue.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
        setDisplayValue(formatted);
      }
    } else {
      setDisplayValue(value);
    }
  }, [value, type]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    switch (type) {
      case 'currency':
        const maskedValue = maskCurrency(inputValue);
        setDisplayValue(maskedValue);
        // Converte back para valor numérico
        const numericValue = unmaskCurrency(maskedValue);
        onChange(numericValue);
        break;
        
      case 'percentage':
        const percentValue = maskPercentage(inputValue);
        setDisplayValue(percentValue);
        onChange(percentValue);
        break;
        
      default:
        setDisplayValue(inputValue);
        onChange(inputValue);
    }
  }, [type, onChange]);

  const handleBlur = () => {
    if (type === 'currency' && displayValue) {
      // Reformata ao sair do campo
      const numericValue = unmaskCurrency(displayValue);
      if (numericValue) {
        const formatted = maskCurrency((parseFloat(numericValue) * 100).toString());
        setDisplayValue(formatted);
      }
    }
  };

  const inputClassName = `
    w-full py-3 border border-gray-200 rounded-xl 
    focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent 
    transition-colors ${className}
    ${prefix ? 'pl-8' : 'pl-4'}
    ${suffix ? 'pr-8' : 'pr-4'}
  `.trim();

  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
          {prefix}
        </span>
      )}
      
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={inputClassName}
        disabled={disabled}
        required={required}
      />
      
      {suffix && (
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
          {suffix}
        </span>
      )}
    </div>
  );
};

export default MaskedInput;