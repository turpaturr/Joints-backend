import { z } from 'zod';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const youtubeUrlSchema = z.string().url("Format URL YouTube tidak valid").refine((value) => {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:') return false;

  const hostname = url.hostname.toLowerCase();
  if (hostname === 'youtu.be') return /^\/[^/]+/.test(url.pathname);

  return ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com'].includes(hostname)
    && (
      (url.pathname === '/watch' && url.searchParams.has('v'))
      || /^\/(embed|shorts)\/[^/]+/.test(url.pathname)
    );
}, "URL harus berupa tautan video YouTube");

const imageBase64Schema = z.string()
  .min(1, "Gambar wajib diunggah")
  .max(7 * 1024 * 1024, "Ukuran gambar maksimal 5 MB")
  .regex(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/, "Format gambar base64 tidak valid");

export const movementSchema = z.object({
  namaGerakan: z.string().min(1, "Nama gerakan wajib diisi"),
  deskripsi: z.string().optional(),
  instruksi: z.string().min(1, "Instruksi wajib diisi"),
  imageBase64: imageBase64Schema,
  imageMimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  youtubeUrl: youtubeUrlSchema,
}).strict().superRefine((data, context) => {
  const imageData = Buffer.from(data.imageBase64, 'base64');
  if (imageData.length === 0 || imageData.length > MAX_IMAGE_BYTES) {
    context.addIssue({
      code: 'custom',
      path: ['imageBase64'],
      message: "Ukuran gambar maksimal 5 MB",
    });
    return;
  }

  const isValidImage = data.imageMimeType === 'image/jpeg'
    ? imageData[0] === 0xff && imageData[1] === 0xd8 && imageData[2] === 0xff
    : data.imageMimeType === 'image/png'
      ? imageData.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
      : imageData.toString('ascii', 0, 4) === 'RIFF'
        && imageData.toString('ascii', 8, 12) === 'WEBP';

  if (!isValidImage) {
    context.addIssue({
      code: 'custom',
      path: ['imageMimeType'],
      message: "Tipe MIME tidak sesuai dengan format gambar",
    });
  }
});

export const movementUpdateSchema = z.object({
  namaGerakan: z.string().min(1, "Nama gerakan wajib diisi").optional(),
  deskripsi: z.string().optional(),
  instruksi: z.string().min(1, "Instruksi wajib diisi").optional(),
  imageBase64: imageBase64Schema.optional(),
  imageMimeType: z.enum(["image/jpeg", "image/png", "image/webp"]).optional(),
  youtubeUrl: youtubeUrlSchema.optional(),
}).strict().superRefine((data, context) => {
  if (Object.keys(data).length === 0) {
    context.addIssue({
      code: 'custom',
      message: "Minimal satu field harus diperbarui",
    });
  }

  if ((data.imageBase64 === undefined) !== (data.imageMimeType === undefined)) {
    context.addIssue({
      code: 'custom',
      path: ['imageBase64'],
      message: "Gambar dan tipe MIME harus diperbarui bersamaan",
    });
    return;
  }

  if (data.imageBase64 === undefined || data.imageMimeType === undefined) return;

  const imageData = Buffer.from(data.imageBase64, 'base64');
  const isValidImage = data.imageMimeType === 'image/jpeg'
    ? imageData[0] === 0xff && imageData[1] === 0xd8 && imageData[2] === 0xff
    : data.imageMimeType === 'image/png'
      ? imageData.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
      : imageData.toString('ascii', 0, 4) === 'RIFF'
        && imageData.toString('ascii', 8, 12) === 'WEBP';

  if (imageData.length === 0 || imageData.length > MAX_IMAGE_BYTES || !isValidImage) {
    context.addIssue({
      code: 'custom',
      path: ['imageBase64'],
      message: "Data gambar tidak valid atau ukurannya melebihi 5 MB",
    });
  }
});

export const prescriptionSchema = z.object({
  patientId: z.string().uuid("ID Pasien tidak valid"),
  movementId: z.string().uuid("ID Gerakan tidak valid"),
  targetRepetisi: z.number().min(1, "Target repetisi minimal 1"),
  frekuensiPerHari: z.number().min(1, "Frekuensi minimal 1"),
  tanggalMulai: z.string().datetime(),
  tanggalBerakhir: z.string().datetime(),
});

export const prescriptionUpdateSchema = z.object({
  movementId: z.string().uuid("ID Gerakan tidak valid").optional(),
  targetRepetisi: z.number().int().min(1, "Target repetisi minimal 1").optional(),
  frekuensiPerHari: z.number().int().min(1, "Frekuensi minimal 1").optional(),
  tanggalMulai: z.string().datetime().optional(),
  tanggalBerakhir: z.string().datetime().optional(),
}).strict().refine((data) => Object.keys(data).length > 0, {
  message: "Minimal satu field harus diperbarui",
});