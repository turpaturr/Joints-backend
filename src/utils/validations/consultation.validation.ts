import { z } from 'zod';

export const createConsultationSchema = z.object({
  subject: z.string().trim().min(1, 'Subjek keluhan harus diisi').max(200, 'Subjek keluhan maksimal 200 karakter'),
  description: z.string().trim().min(1, 'Deskripsi keluhan harus diisi'),
  location: z.union([
    z.string().trim().max(120, 'Lokasi keluhan maksimal 120 karakter').transform((v) => v || null),
    z.null(),
  ]).optional(),
  painScale: z.number().int().min(0, 'Skala nyeri minimal 0').max(10, 'Skala nyeri maksimal 10').nullable().optional(),
  symptomStartedAt: z.union([
    z.string().datetime({ message: 'Format tanggal mulai keluhan harus ISO datetime' }).transform((val) => new Date(val)),
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD').transform((date) => new Date(`${date}T00:00:00.000Z`)),
    z.literal('').transform(() => null),
    z.null(),
  ]).optional(),
}).strict();

export const respondConsultationSchema = z.object({
  response: z.string().trim().min(1, 'Respons atau saran harus diisi'),
  status: z.enum(['IN_PROGRESS', 'RESOLVED']).optional(),
}).strict();

export const updateConsultationStatusSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'RESOLVED']),
}).strict();

export const consultationIdParamsSchema = z.object({
  consultationId: z.string().uuid('ID konsultasi tidak valid'),
}).strict();

export const consultationQuerySchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'RESOLVED']).optional(),
  patientId: z.string().uuid('ID pasien tidak valid').optional(),
}).strict();

