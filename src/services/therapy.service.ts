import prisma from '../prisma';
import { Prisma } from '@prisma/client';
import type { z } from 'zod';
import type { therapySessionSchema } from '../utils/validations/therapy-session.validation';

type TherapySessionInput = z.infer<typeof therapySessionSchema>;

// --- Master Gerakan (Therapy Movement) ---
export const createMovement = async (data: Prisma.TherapyMovementCreateInput) => {
  return await prisma.therapyMovement.create({ data });
};

export const getAllMovements = async () => {
  return await prisma.therapyMovement.findMany({ orderBy: { namaGerakan: 'asc' } });
};

// --- Resep Terapi (Therapy Prescription) ---
export const createPrescription = async (nakesId: string, data: any) => {
  return await prisma.therapyPrescription.create({
    data: { ...data, nakesId },
    include: { movement: true }
  });
};

export const getPrescriptionsByPatient = async (patientId: string) => {
  return await prisma.therapyPrescription.findMany({
    where: { patientId },
    include: {
      movement: {
        select: { namaGerakan: true, instruksi: true, mediaUrl: true, mediaType: true }
      }
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const deletePrescription = async (id: string) => {
  return await prisma.therapyPrescription.delete({ where: { id } });
};

export const createTherapySession = async (
  userId: string,
  data: TherapySessionInput,
) => {
  const patient = await prisma.patientProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!patient) return null;

  if (data.prescriptionId) {
    const prescription = await prisma.therapyPrescription.findFirst({
      where: { id: data.prescriptionId, patientId: patient.id },
      select: { id: true },
    });
    if (!prescription) return null;
  }

  return prisma.therapySession.create({
    data: {
      patientId: patient.id,
      prescriptionId: data.prescriptionId,
      programName: data.programName,
      estimatedAngle: data.estimatedAngle,
      validRepetitions: data.validRepetitions,
      durationMs: data.durationMs,
      sampleCount: data.sampleCount,
      performedAt: new Date(data.performedAt),
    },
  });
};