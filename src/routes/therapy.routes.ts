import { Router } from 'express';
import express from 'express';
import * as therapyController from '../controllers/therapy.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware'; 

const router = Router();

router.use(requireAuth, requireRole(['NAKES', 'PATIENT']));

router.get('/patients', requireRole(['NAKES']), therapyController.listNakesPatients);
router.post('/movements', requireRole(['NAKES']), express.json({ limit: '7mb' }), therapyController.addMovement);
router.patch('/movements/:movementId', requireRole(['NAKES']), express.json({ limit: '7mb' }), therapyController.editMovement);
router.delete('/movements/:movementId', requireRole(['NAKES']), therapyController.removeMovement);
router.get('/movements', requireRole(['NAKES', 'PATIENT']), therapyController.listMovements);
router.post('/prescriptions', requireRole(['NAKES']), therapyController.addPrescription);
router.patch('/prescriptions/:prescriptionId', requireRole(['NAKES']), therapyController.editPrescription);
router.delete('/prescriptions/:prescriptionId', requireRole(['NAKES']), therapyController.removePrescription);
router.get('/prescriptions/patient/:patientId', requireRole(['NAKES', 'PATIENT']), therapyController.getPatientPrescriptions);

export default router;