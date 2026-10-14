import { z } from 'zod';

const isValidDateString = (value: string) => !Number.isNaN(Date.parse(value));

export const createMedicationScheduleSchema = z
  .object({
    patientId: z.string().trim().uuid('ID pasien tidak valid'),
    medicationName: z.string().trim().min(1, 'Nama obat wajib diisi').max(100, 'Nama obat terlalu panjang'),
    dosage: z.string().trim().min(1, 'Dosis obat wajib diisi'),
    frequency: z.string().trim().min(1, 'Frekuensi konsumsi wajib diisi'),
    timeToTake: z
      .union([
        z.string().trim().min(1, 'Waktu konsumsi wajib diisi'),
        z.array(z.string().trim().min(1, 'Waktu konsumsi wajib diisi')).min(1, 'Waktu konsumsi wajib diisi'),
      ])
      .transform((value) => (Array.isArray(value) ? value : [value]))
      .refine((items) => items.every((item) => item.trim().length > 0), {
        message: 'Waktu konsumsi wajib diisi',
      }),
    startDate: z.string().trim().refine(isValidDateString, {
      message: 'Tanggal mulai tidak valid',
    }),
    endDate: z.string().trim().refine(isValidDateString, {
      message: 'Tanggal akhir tidak valid',
    }),
  })
  .superRefine((data, ctx) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    if (end < start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endDate'],
        message: 'Tanggal akhir harus sama atau setelah tanggal mulai',
      });
    }
  });

export const markMedicationAsTakenSchema = z.object({
  scheduleId: z.string().trim().uuid('ID jadwal obat tidak valid'),
}).strict();
