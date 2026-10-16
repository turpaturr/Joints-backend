import { Router } from 'express';
import * as consultationController from '../controllers/consultation.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Pasien membuat laporan keluhan
router.post(
  '/',
  requireAuth,
  requireRole(['PATIENT']),
  consultationController.createConsultation,
);

// Mendapatkan daftar laporan keluhan (Pasien melihat miliknya, Nakes melihat pasien binaannya)
router.get(
  '/',
  requireAuth,
  requireRole(['PATIENT', 'NAKES']),
  consultationController.getConsultations,
);

// Detail laporan keluhan
router.get(
  '/:consultationId',
  requireAuth,
  requireRole(['PATIENT', 'NAKES']),
  consultationController.getConsultationById,
);

// Nakes memberikan respons / tindak lanjut / saran
router.post(
  '/:consultationId/responses',
  requireAuth,
  requireRole(['NAKES']),
  consultationController.respondConsultation,
);

// Nakes memperbarui status penanganan laporan
router.patch(
  '/:consultationId/status',
  requireAuth,
  requireRole(['NAKES']),
  consultationController.updateConsultationStatus,
);

export default router;

