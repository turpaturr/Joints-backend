import { Router } from 'express';
import { createSchedule, getPatientSchedules, markAsTaken } from '../controllers/medication.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();


router.post(
  '/schedules', 
  requireAuth, 
  requireRole(['NAKES']), 
  createSchedule
);

router.get(
  '/schedules', 
  requireAuth, 
  requireRole(['PATIENT']), 
  getPatientSchedules
);

router.post(
  '/logs', 
  requireAuth, 
  requireRole(['PATIENT']), 
  markAsTaken
);

export default router;