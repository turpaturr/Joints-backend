import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  role: z.enum(['PATIENT', 'NAKES']),
  namaLengkap: z.string().min(1, 'Nama lengkap wajib diisi')
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Password saat ini wajib diisi'),
  newPassword: z.string().min(6, 'Password baru minimal 6 karakter'),
});