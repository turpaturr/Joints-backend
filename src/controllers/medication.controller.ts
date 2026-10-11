import { Request, Response } from 'express';
import { ZodError } from 'zod';
import * as MedicationService from '../services/medication.service';
import {
  createMedicationScheduleSchema,
  markMedicationAsTakenSchema,
} from '../utils/validations/medication.validation';

export const createSchedule = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id || (req as any).user.userId;
    const validatedData = createMedicationScheduleSchema.parse(req.body);
    const schedule = await MedicationService.createMedicationSchedule(userId, validatedData);

    res.status(201).json({
      success: true,
      message: 'Jadwal obat berhasil dibuat',
      data: schedule,
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Data jadwal obat tidak valid',
        error: {
          code: 'VALIDATION_ERROR',
          details: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
      });
    }

    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPatientSchedules = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id || (req as any).user.userId;
    const schedules = await MedicationService.getPatientMedications(userId);

    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil jadwal obat',
      data: schedules,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsTaken = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id || (req as any).user.userId;
    const validatedData = markMedicationAsTakenSchema.parse(req.body);
    const log = await MedicationService.logMedicationTaken(userId, validatedData.scheduleId);

    res.status(201).json({
      success: true,
      message: 'Obat berhasil ditandai sudah diminum',
      data: log,
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Data log obat tidak valid',
        error: {
          code: 'VALIDATION_ERROR',
          details: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
      });
    }

    return res.status(403).json({ success: false, message: error.message });
  }
};