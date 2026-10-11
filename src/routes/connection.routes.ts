import { Router } from 'express';
import * as connectionController from '../controllers/connection.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get(
  '/status',
  requireAuth,
  requireRole(['PATIENT']),
  connectionController.getPatientConnection,
);
router.post(
  '/code',
  requireAuth,
  requireRole(['PATIENT']),
  connectionController.createPatientCode,
);
router.post(
  '/redeem',
  requireAuth,
  requireRole(['NAKES']),
  connectionController.redeemPatientCode,
);

export default router;
