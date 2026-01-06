import { z } from 'zod';

// Strong password validation schema
// Requires: 8+ chars, uppercase, lowercase, number, special character
export const strongPasswordSchema = z
  .string()
  .min(8, 'Senha deve ter no mínimo 8 caracteres')
  .max(100, 'Senha muito longa')
  .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
  .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
  .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
  .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial (!@#$%^&*)');

// Password requirements message for UI
export const passwordRequirements = [
  'Mínimo de 8 caracteres',
  'Pelo menos uma letra maiúscula',
  'Pelo menos uma letra minúscula',
  'Pelo menos um número',
  'Pelo menos um caractere especial (!@#$%^&*)',
];
