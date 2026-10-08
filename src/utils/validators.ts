import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  role: z.enum(['PATIENT', 'NAKES'])
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});