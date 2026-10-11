import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import * as connectionService from '../services/connection.service';
import { redeemConnectionCodeSchema } from '../utils/validations/connection.validation';

const getUserId = (req: Request): string | null => {
  const userId = (req as Request & { user?: { userId?: unknown } }).user?.userId;
  return typeof userId === 'string' ? userId : null;
};

const respondWithServiceError = (res: Response, error: connectionService.ConnectionServiceError) => {
  const status = error.code === 'PATIENT_PROFILE_NOT_FOUND' ||
    error.code === 'NAKES_PROFILE_NOT_FOUND'
    ? 404
    : error.code === 'PATIENT_ALREADY_CONNECTED'
      ? 409
      : 400;

  return res.status(status).json({
    success: false,
    message: error.message,
    error: { code: error.code },
  });
};

export const getPatientConnection = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'ID pengguna tidak ditemukan di token',
        error: { code: 'INVALID_TOKEN_PAYLOAD' },
      });
    }

    const connection = await connectionService.getPatientConnection(userId);
    return res.status(200).json({
      success: true,
      message: 'Status koneksi pasien',
      data: connection,
    });
  } catch (error) {
    if (error instanceof connectionService.ConnectionServiceError) {
      return respondWithServiceError(res, error);
    }
    return next(error);
  }
};

export const createPatientCode = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'ID pengguna tidak ditemukan di token',
        error: { code: 'INVALID_TOKEN_PAYLOAD' },
      });
    }

    const result = await connectionService.createPatientConnectionCode(userId);
    return res.status(201).json({
      success: true,
      message: 'Kode penghubung berhasil dibuat',
      data: result,
    });
  } catch (error) {
    if (error instanceof connectionService.ConnectionServiceError) {
      return respondWithServiceError(res, error);
    }
    return next(error);
  }
};

export const redeemPatientCode = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'ID pengguna tidak ditemukan di token',
        error: { code: 'INVALID_TOKEN_PAYLOAD' },
      });
    }

    const { code } = redeemConnectionCodeSchema.parse(req.body);
    const patient = await connectionService.connectPatientWithCode(userId, code);
    return res.status(200).json({
      success: true,
      message: 'Pasien berhasil dihubungkan',
      data: patient,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Kode penghubung tidak valid',
        error: { code: 'VALIDATION_ERROR', details: error.issues },
      });
    }
    if (error instanceof connectionService.ConnectionServiceError) {
      return respondWithServiceError(res, error);
    }
    return next(error);
  }
};
