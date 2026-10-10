import prisma from '../prisma';
import { Prisma } from '@prisma/client';

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