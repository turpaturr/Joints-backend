import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as therapyService from '../services/therapy.service';
import {
  movementSchema,
  movementUpdateSchema,
  prescriptionSchema,
  prescriptionUpdateSchema,
} from '../utils/validations/therapy.validation';

const getUserId = (req: Request): string | null => {
  const user = (req as any).user;
  const userId = user?.userId || user?.id || user?.penggunaId;
  return typeof userId === 'string' ? userId : null;
};

const getResourceId = (req: Request, res: Response, param: string): string | null => {
  const parsed = z.string().uuid().safeParse(req.params[param]);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: 'ID resource tidak valid',
      error: { code: 'INVALID_ID' },
    });
    return null;
  }
  return parsed.data;
};

export const addMovement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = movementSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Data gerakan tidak valid",
        error: { code: "INVALID_MOVEMENT", details: validation.error.issues },
      });
    }
    const movement = await therapyService.createMovement(validation.data);
    res.status(201).json({ success: true, message: "Master gerakan berhasil dibuat", data: movement });
  } catch (error) {
    next(error);
  }
};

export const listMovements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const movements = await therapyService.getAllMovements();
    res.status(200).json({ success: true, message: "Daftar gerakan", data: movements });
  } catch (error) {
    next(error);
  }
};

export const editMovement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = getResourceId(req, res, 'movementId');
    if (!id) return;
    const validation = movementUpdateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Data gerakan tidak valid',
        error: { code: 'INVALID_MOVEMENT', details: validation.error.issues },
      });
    }
    const movement = await therapyService.updateMovement(id, validation.data);
    if (!movement) {
      return res.status(404).json({
        success: false,
        message: 'Gerakan terapi tidak ditemukan',
        error: { code: 'MOVEMENT_NOT_FOUND' },
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Gerakan terapi berhasil diperbarui',
      data: movement,
    });
  } catch (error) {
    next(error);
  }
};

export const removeMovement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = getResourceId(req, res, 'movementId');
    if (!id) return;
    const result = await therapyService.deleteMovement(id);
    if (result === 'NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: 'Gerakan terapi tidak ditemukan',
        error: { code: 'MOVEMENT_NOT_FOUND' },
      });
    }
    if (result === 'IN_USE') {
      return res.status(409).json({
        success: false,
        message: 'Gerakan tidak dapat dihapus karena masih digunakan resep terapi',
        error: { code: 'MOVEMENT_IN_USE' },
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Gerakan terapi berhasil dihapus',
      data: { id },
    });
  } catch (error) {
    next(error);
  }
};

export const addPrescription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = prescriptionSchema.parse(req.body);
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "ID tidak ditemukan di dalam token JWT",
        error: { code: "INVALID_TOKEN_PAYLOAD" }
      });
    }
    const prescription = await therapyService.createPrescription(userId, validatedData);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Pasien tidak ditemukan atau bukan pasien yang ditangani',
        error: { code: 'PATIENT_NOT_FOUND_OR_NOT_ASSIGNED' },
      });
    }
    
    res.status(201).json({ success: true, message: "Resep berhasil dibuat", data: prescription });
  } catch (error) {
    next(error);
  }
};

export const editPrescription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = getResourceId(req, res, 'prescriptionId');
    if (!id) return;
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'ID pengguna tidak ditemukan di token JWT',
        error: { code: 'INVALID_TOKEN_PAYLOAD' },
      });
    }
    const validation = prescriptionUpdateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Data resep terapi tidak valid',
        error: { code: 'INVALID_PRESCRIPTION', details: validation.error.issues },
      });
    }

    const result = await therapyService.updatePrescription(userId, id, validation.data);
    if (result.kind === 'NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: 'Resep tidak ditemukan atau bukan milik pasien yang ditangani',
        error: { code: 'PRESCRIPTION_NOT_FOUND' },
      });
    }
    if (result.kind === 'INVALID_DATE_RANGE') {
      return res.status(400).json({
        success: false,
        message: 'Tanggal berakhir harus sama atau setelah tanggal mulai',
        error: { code: 'INVALID_DATE_RANGE' },
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Resep terapi berhasil diperbarui',
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

export const removePrescription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = getResourceId(req, res, 'prescriptionId');
    if (!id) return;
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'ID pengguna tidak ditemukan di token JWT',
        error: { code: 'INVALID_TOKEN_PAYLOAD' },
      });
    }

    const result = await therapyService.deletePrescription(userId, id);
    if (result === 'NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: 'Resep tidak ditemukan atau bukan milik pasien yang ditangani',
        error: { code: 'PRESCRIPTION_NOT_FOUND' },
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Resep terapi berhasil dihapus',
      data: { id },
    });
  } catch (error) {
    next(error);
  }
};

export const getPatientPrescriptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patientId = req.params.patientId as string;
    const user = (req as any).user;
    const userId = user?.userId;
    const role = user?.role;
    if (typeof userId !== 'string' || (role !== 'PATIENT' && role !== 'NAKES')) {
      return res.status(401).json({
        success: false,
        message: 'Token pengguna tidak valid',
        error: { code: 'INVALID_TOKEN_PAYLOAD' },
      });
    }

    const prescriptions = await therapyService.getPrescriptionsByPatient(userId, role, patientId);
    if (!prescriptions) {
      return res.status(404).json({
        success: false,
        message: 'Pasien tidak ditemukan atau tidak dapat diakses',
        error: { code: 'PATIENT_NOT_FOUND' },
      });
    }
    res.status(200).json({ success: true, message: "Resep terapi pasien", data: prescriptions });
  } catch (error) {
    next(error);
  }
};

export const listNakesPatients = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;
    if (typeof userId !== 'string') {
      return res.status(401).json({
        success: false,
        message: 'ID pengguna tidak ditemukan di token JWT',
        error: { code: 'INVALID_TOKEN_PAYLOAD' },
      });
    }

    const patients = await therapyService.getPatientsByNakes(userId);
    if (!patients) {
      return res.status(404).json({
        success: false,
        message: 'Profil nakes tidak ditemukan',
        error: { code: 'NAKES_PROFILE_NOT_FOUND' },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Daftar pasien nakes',
      data: patients,
    });
  } catch (error) {
    next(error);
  }
};