import { Request, Response } from 'express';
import * as MedicationService from '../services/medication.service';

export const createSchedule = async (req: Request, res: Response) => {
  try {
        const userId = (req as any).user.id || (req as any).user.userId;
        const schedule = await MedicationService.createMedicationSchedule(userId, req.body);
    
        res.status(201).json({
        success: true,
        message: "Jadwal obat berhasil dibuat",
        data: schedule
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPatientSchedules = async (req: Request, res: Response) => {
  try {
        const userId = (req as any).user.id || (req as any).user.userId;
        const schedules = await MedicationService.getPatientMedications(userId);
    
        res.status(200).json({
        success: true,
        message: "Berhasil mengambil jadwal obat",
        data: schedules
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsTaken = async (req: Request, res: Response) => {
  try {
        const userId = (req as any).user.id || (req as any).user.userId;
        const { scheduleId } = req.body;
        const log = await MedicationService.logMedicationTaken(userId, scheduleId);
    
        res.status(201).json({
        success: true,
        message: "Obat berhasil ditandai sudah diminum",
        data: log
    });
  } catch (error: any) {
    res.status(403).json({ success: false, message: error.message });
  }
};