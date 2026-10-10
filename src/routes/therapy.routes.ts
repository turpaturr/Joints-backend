import { Router } from 'express';
import * as therapyController from '../controllers/therapy.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware'; 

const router = Router();

router.use(requireAuth, requireRole(['NAKES', 'PATIENT']));

router.post('/movements', requireRole(['NAKES']), therapyController.addMovement);
router.get('/movements', requireRole(['NAKES', 'PATIENT']), therapyController.listMovements);
router.post('/prescriptions', requireRole(['NAKES']), therapyController.addPrescription);
router.get('/prescriptions/patient/:patientId', requireRole(['NAKES', 'PATIENT']), therapyController.getPatientPrescriptions);

export default router;