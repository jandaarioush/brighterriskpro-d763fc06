import { useState } from 'react';

export const usePhoneMask = (initialValue: string = '') => {
  const [value, setValue] = useState(initialValue);

  const applyMask = (input: string): string => {
    // Remove tudo exceto números
    const numbers = input.replace(/\D/g, '');
    
    // Limita a 11 dígitos (DDD + número)
    const limited = numbers.slice(0, 11);
    
    // Aplica a máscara +55 (XX) XXXXX-XXXX
    if (limited.length <= 2) {
      return `+55 ${limited}`;
    } else if (limited.length <= 7) {
      return `+55 (${limited.slice(0, 2)}) ${limited.slice(2)}`;
    } else {
      return `+55 (${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
    }
  };

  const handleChange = (input: string) => {
    const masked = applyMask(input);
    setValue(masked);
    return masked;
  };

  return { value, handleChange, setValue };
};
