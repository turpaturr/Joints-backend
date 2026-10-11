import { z } from 'zod';

export const redeemConnectionCodeSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Kode harus terdiri dari 6 digit'),
}).strict();
