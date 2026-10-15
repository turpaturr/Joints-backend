import { Router } from 'express';
import * as therapySessionController from '../controllers/therapy-session.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.post(
  '/',
  requireAuth,
  requireRole(['PATIENT']),
  therapySessionController.createTherapySession,
);

router.get(
  '/patient/:patientId',
  requireAuth,
  requireRole(['NAKES']),
  therapySessionController.listPatientTherapySessions,
);

export default router;
