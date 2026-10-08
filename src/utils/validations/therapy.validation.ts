import { z } from 'zod';

export const movementSchema = z.object({
  namaGerakan: z.string().min(1, "Nama gerakan wajib diisi"),
  deskripsi: z.string().optional(),
  instruksi: z.string().min(1, "Instruksi wajib diisi"),
  mediaUrl: z.string().url("Format URL media tidak valid").optional(),
  mediaType: z.enum(["VIDEO", "IMAGE"]).optional(),
});

export const prescriptionSchema = z.object({
  patientId: z.string().uuid("ID Pasien tidak valid"),
  movementId: z.string().uuid("ID Gerakan tidak valid"),
  targetRepetisi: z.number().min(1, "Target repetisi minimal 1"),
  frekuensiPerHari: z.number().min(1, "Frekuensi minimal 1"),
  tanggalMulai: z.string().datetime(),
  tanggalBerakhir: z.string().datetime(),
});