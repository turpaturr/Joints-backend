import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import * as therapyService from '../services/therapy.service';
import { therapySessionSchema } from '../utils/validations/therapy-session.validation';

export const createTherapySession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedData = therapySessionSchema.parse(req.body);
    const userId = (req as any).user?.userId;
    if (typeof userId !== 'string') {
      return res.status(401).json({
        success: false,
        message: 'ID pengguna tidak ditemukan di token',
        error: { code: 'INVALID_TOKEN_PAYLOAD' },
      });
    }

    const session = await therapyService.createTherapySession(
      userId,
      validatedData,
    );
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Profil pasien atau resep terapi tidak ditemukan',
        error: { code: 'THERAPY_CONTEXT_NOT_FOUND' },
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Sesi terapi berhasil disimpan',
      data: session,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Data sesi terapi tidak valid',
        error: { code: 'VALIDATION_ERROR', details: error.issues },
      });
    }
    next(error);
  }
};
