import { useState } from 'react';

export const usePhoneMask = (initialValue: string = '') => {
  const [value, setValue] = useState(initialValue);

  const applyMask = (input: string): string => {
    // Remove tudo que não for número
    const numbers = input.replace(/\D/g, '');
    
    // Se não tiver números, retorna vazio com prefixo +
    if (numbers.length === 0) {
      return '+';
    }
    
    // Limita a 15 dígitos (padrão E.164 para números internacionais)
    const limited = numbers.slice(0, 15);
    
    // Retorna apenas com o + na frente, sem formatação específica
    // Isso permite DDIs de qualquer país (1-3 dígitos) + número local
    return `+${limited}`;
  };

  const handleChange = (input: string) => {
    const masked = applyMask(input);
    setValue(masked);
    return masked;
  };

  return { value, handleChange, setValue };
};
