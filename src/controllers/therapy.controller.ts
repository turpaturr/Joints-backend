import { Request, Response, NextFunction } from 'express';
import * as therapyService from '../services/therapy.service';
import { movementSchema, prescriptionSchema } from '../utils/validations/therapy.validation';

export const addMovement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = movementSchema.parse(req.body);
    const movement = await therapyService.createMovement(validatedData);
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

export const addPrescription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = prescriptionSchema.parse(req.body);
    const user = (req as any).user;
    console.log("Isi token JWT:", user);
    const userId = user?.id || user?.userId || user?.penggunaId;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "ID tidak ditemukan di dalam token JWT",
        error: { code: "INVALID_TOKEN_PAYLOAD" }
      });
    }
    const prescription = await therapyService.createPrescription(userId, validatedData);
    
    res.status(201).json({ success: true, message: "Resep berhasil dibuat", data: prescription });
  } catch (error) {
    next(error);
  }
};

export const getPatientPrescriptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patientId = req.params.patientId as string;
    const prescriptions = await therapyService.getPrescriptionsByPatient(patientId);
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