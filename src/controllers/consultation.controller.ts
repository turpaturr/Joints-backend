import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import * as consultationService from '../services/consultation.service';
import {
  consultationIdParamsSchema,
  consultationQuerySchema,
  createConsultationSchema,
  respondConsultationSchema,
  updateConsultationStatusSchema,
} from '../utils/validations/consultation.validation';

const getUserId = (req: Request): string | null => {
  const user = (req as Request & { user?: { userId?: unknown; id?: unknown } }).user;
  const userId = user?.userId ?? user?.id;
  return typeof userId === 'string' ? userId : null;
};

const getUserRole = (req: Request): string | null => {
  const user = (req as Request & { user?: { role?: unknown } }).user;
  return typeof user?.role === 'string' ? user.role : null;
};

const formatZodError = (res: Response, error: ZodError) => {
  return res.status(400).json({
    success: false,
    message: 'Validasi input tidak valid',
    error: {
      code: 'VALIDATION_ERROR',
      details: error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    },
  });
};

const respondWithServiceError = (res: Response, error: consultationService.ConsultationServiceError) => {
  const status =
    error.code === 'PATIENT_PROFILE_NOT_FOUND' ||
    error.code === 'NAKES_PROFILE_NOT_FOUND' ||
    error.code === 'CONSULTATION_NOT_FOUND'
      ? 404
      : error.code === 'FORBIDDEN_ACCESS'
        ? 403
        : 400;

  return res.status(status).json({
    success: false,
    message: error.message,
    error: { code: error.code },
  });
};

export const createConsultation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Pengguna tidak terautentikasi',
        error: { code: 'UNAUTHORIZED' },
      });
    }

    const validatedData = createConsultationSchema.parse(req.body);
    const consultation = await consultationService.createConsultation(userId, validatedData);

    return res.status(201).json({
      success: true,
      message: 'Laporan keluhan berhasil dikirim ke Nakes',
      data: consultation,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return formatZodError(res, error);
    }
    if (error instanceof consultationService.ConsultationServiceError) {
      return respondWithServiceError(res, error);
    }
    return next(error);
  }
};

export const getConsultations = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getUserId(req);
    const role = getUserRole(req);
    if (!userId || !role) {
      return res.status(401).json({
        success: false,
        message: 'Pengguna tidak terautentikasi',
        error: { code: 'UNAUTHORIZED' },
      });
    }

    const query = consultationQuerySchema.parse(req.query);
    const consultations = await consultationService.getConsultations(userId, role, query);

    return res.status(200).json({
      success: true,
      message: 'Daftar konsultasi berhasil diambil',
      data: consultations,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return formatZodError(res, error);
    }
    if (error instanceof consultationService.ConsultationServiceError) {
      return respondWithServiceError(res, error);
    }
    return next(error);
  }
};

export const getConsultationById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getUserId(req);
    const role = getUserRole(req);
    if (!userId || !role) {
      return res.status(401).json({
        success: false,
        message: 'Pengguna tidak terautentikasi',
        error: { code: 'UNAUTHORIZED' },
      });
    }

    const { consultationId } = consultationIdParamsSchema.parse(req.params);
    const consultation = await consultationService.getConsultationById(userId, role, consultationId);

    return res.status(200).json({
      success: true,
      message: 'Detail konsultasi berhasil diambil',
      data: consultation,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return formatZodError(res, error);
    }
    if (error instanceof consultationService.ConsultationServiceError) {
      return respondWithServiceError(res, error);
    }
    return next(error);
  }
};

export const respondConsultation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Pengguna tidak terautentikasi',
        error: { code: 'UNAUTHORIZED' },
      });
    }

    const { consultationId } = consultationIdParamsSchema.parse(req.params);
    const body = respondConsultationSchema.parse(req.body);

    const consultation = await consultationService.respondConsultation(
      userId,
      consultationId,
      body,
    );

    return res.status(200).json({
      success: true,
      message: 'Tindak lanjut/saran konsultasi berhasil disimpan',
      data: consultation,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return formatZodError(res, error);
    }
    if (error instanceof consultationService.ConsultationServiceError) {
      return respondWithServiceError(res, error);
    }
    return next(error);
  }
};

export const updateConsultationStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Pengguna tidak terautentikasi',
        error: { code: 'UNAUTHORIZED' },
      });
    }

    const { consultationId } = consultationIdParamsSchema.parse(req.params);
    const { status } = updateConsultationStatusSchema.parse(req.body);

    const consultation = await consultationService.updateConsultationStatus(
      userId,
      consultationId,
      status,
    );

    return res.status(200).json({
      success: true,
      message: 'Status konsultasi berhasil diperbarui',
      data: consultation,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return formatZodError(res, error);
    }
    if (error instanceof consultationService.ConsultationServiceError) {
      return respondWithServiceError(res, error);
    }
    return next(error);
  }
};

