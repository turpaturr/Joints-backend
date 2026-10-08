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
    const nakesId = (req as any).user.id;

    const prescription = await therapyService.createPrescription(nakesId, validatedData);
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