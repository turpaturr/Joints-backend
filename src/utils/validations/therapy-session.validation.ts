import { z } from 'zod';

export const therapySessionSchema = z.object({
  programName: z.string().trim().min(1).max(120),
  estimatedAngle: z.number().finite().min(0).max(360),
  validRepetitions: z.number().int().min(0),
  durationMs: z.number().int().min(0),
  sampleCount: z.number().int().min(0),
  performedAt: z.string().datetime(),
  prescriptionId: z.string().uuid().optional(),
});
