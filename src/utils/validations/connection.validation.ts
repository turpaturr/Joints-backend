import { z } from 'zod';

export const redeemConnectionCodeSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Kode harus terdiri dari 6 digit'),
}).strict();

const optionalClinicalText = (maxLength: number) =>
  z.union([
    z.string().trim().max(maxLength).transform((value) => value || null),
    z.null(),
  ]).optional();

export const updatePatientClinicalDataSchema = z.object({
  kondisiMedis: optionalClinicalText(500),
  riwayatPenyakit: optionalClinicalText(2000),
  alergi: optionalClinicalText(1000),
  lokasiKeluhan: optionalClinicalText(120),
  tanggalMulaiKeluhan: z.union([
    z.iso.date().transform((date) => new Date(`${date}T00:00:00.000Z`)),
    z.literal('').transform(() => null),
    z.null(),
  ]).optional(),
  skalaNyeri: z.number().int().min(0).max(10).nullable().optional(),
  catatanAwal: optionalClinicalText(3000),
}).strict().refine((data) => Object.keys(data).length > 0, {
  message: 'Minimal satu data klinis harus diisi',
});

export const patientIdParamsSchema = z.object({
  patientId: z.string().uuid('ID pasien tidak valid'),
}).strict();
