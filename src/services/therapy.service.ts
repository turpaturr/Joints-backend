import prisma from '../prisma';
import { Prisma } from '@prisma/client';
import type { Role } from '@prisma/client';
import type { z } from 'zod';
import type {
  movementSchema,
  movementUpdateSchema,
  prescriptionSchema,
  prescriptionUpdateSchema,
} from '../utils/validations/therapy.validation';
import type { therapySessionSchema } from '../utils/validations/therapy-session.validation';

type MovementInput = z.infer<typeof movementSchema>;
type MovementUpdateInput = z.infer<typeof movementUpdateSchema>;
type PrescriptionInput = z.infer<typeof prescriptionSchema>;
type PrescriptionUpdateInput = z.infer<typeof prescriptionUpdateSchema>;
type TherapySessionInput = z.infer<typeof therapySessionSchema>;

const movementWithMediaSelect = {
  id: true,
  namaGerakan: true,
  deskripsi: true,
  instruksi: true,
  mediaUrl: true,
  mediaType: true,
  imageData: true,
  imageMimeType: true,
  youtubeUrl: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TherapyMovementSelect;

type MovementWithMedia = Prisma.TherapyMovementGetPayload<{
  select: typeof movementWithMediaSelect;
}>;

const serializeMovement = ({ imageData, ...movement }: MovementWithMedia) => ({
  ...movement,
  imageBase64: imageData ? Buffer.from(imageData).toString('base64') : null,
});

// --- Master Gerakan (Therapy Movement) ---
export const createMovement = async (data: MovementInput) => {
  const { imageBase64, ...movementData } = data;
  const movement = await prisma.therapyMovement.create({
    data: {
      ...movementData,
      imageData: Uint8Array.from(Buffer.from(imageBase64, 'base64')),
    },
    select: movementWithMediaSelect,
  });
  return serializeMovement(movement);
};

export const updateMovement = async (id: string, data: MovementUpdateInput) => {
  const { imageBase64, ...movementData } = data;
  const updateData: Prisma.TherapyMovementUpdateInput = {
    ...movementData,
    ...(imageBase64 !== undefined
      ? { imageData: Uint8Array.from(Buffer.from(imageBase64, 'base64')) }
      : {}),
  };

  try {
    const movement = await prisma.therapyMovement.update({
      where: { id },
      data: updateData,
      select: movementWithMediaSelect,
    });
    return serializeMovement(movement);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return null;
    }
    throw error;
  }
};

export const deleteMovement = async (id: string) => {
  try {
    await prisma.therapyMovement.delete({ where: { id } });
    return 'DELETED' as const;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') return 'NOT_FOUND' as const;
      if (error.code === 'P2003') return 'IN_USE' as const;
    }
    throw error;
  }
};

export const getAllMovements = async () => {
  const movements = await prisma.therapyMovement.findMany({
    select: movementWithMediaSelect,
    orderBy: { namaGerakan: 'asc' },
  });
  return movements.map(serializeMovement);
};

// --- Resep Terapi (Therapy Prescription) ---
export const createPrescription = async (userId: string, data: PrescriptionInput) => {
  const nakes = await prisma.nakesProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!nakes) return null;

  const patient = await prisma.patientProfile.findFirst({
    where: { id: data.patientId, nakesId: nakes.id },
    select: { id: true },
  });
  if (!patient) return null;

  const prescription = await prisma.therapyPrescription.create({
    data: { ...data, patientId: patient.id, nakesId: nakes.id },
    include: { movement: { select: movementWithMediaSelect } },
  });
  return {
    ...prescription,
    movement: serializeMovement(prescription.movement),
  };
};

export const getPrescriptionsByPatient = async (
  userId: string,
  role: Role,
  patientId: string,
) => {
  const patient = role === 'PATIENT'
    ? await prisma.patientProfile.findFirst({
      where: { id: patientId, userId },
      select: { id: true },
    })
    : await prisma.patientProfile.findFirst({
      where: { id: patientId, nakes: { userId } },
      select: { id: true },
    });

  if (!patient) return null;

  const prescriptions = await prisma.therapyPrescription.findMany({
    where: { patientId: patient.id },
    include: {
      movement: {
        select: movementWithMediaSelect,
      }
    },
    orderBy: { createdAt: 'desc' },
  });
  return prescriptions.map((prescription) => ({
    ...prescription,
    movement: serializeMovement(prescription.movement),
  }));
};

export const getPatientsByNakes = async (userId: string) => {
  const nakes = await prisma.nakesProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!nakes) return null;

  return prisma.patientProfile.findMany({
    where: { nakesId: nakes.id },
    include: {
      user: { select: { id: true, email: true } },
      _count: { select: { therapySessions: true } },
    },
    orderBy: { namaLengkap: 'asc' },
  });
};

export const getTherapySessionsByPatientAndNakes = async (
  userId: string,
  patientId: string,
) => {
  const nakes = await prisma.nakesProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!nakes) return null;

  const patient = await prisma.patientProfile.findFirst({
    where: { id: patientId, nakesId: nakes.id },
    select: { id: true },
  });
  if (!patient) return null;

  const sessions = await prisma.therapySession.findMany({
    where: { patientId: patient.id },
    include: {
      prescription: {
        include: { movement: { select: movementWithMediaSelect } },
      },
    },
    orderBy: { performedAt: 'desc' },
  });
  return sessions.map((session) => ({
    ...session,
    prescription: session.prescription
      ? {
        ...session.prescription,
        movement: serializeMovement(session.prescription.movement),
      }
      : null,
  }));
};

export const updatePrescription = async (
  userId: string,
  id: string,
  data: PrescriptionUpdateInput,
) => {
  const prescription = await prisma.therapyPrescription.findUnique({
    where: { id },
    select: {
      patientId: true,
      tanggalMulai: true,
      tanggalBerakhir: true,
    },
  });
  if (!prescription) return { kind: 'NOT_FOUND' as const };

  const patient = await prisma.patientProfile.findFirst({
    where: { id: prescription.patientId, nakes: { userId } },
    select: { id: true },
  });
  if (!patient) return { kind: 'NOT_FOUND' as const };

  const tanggalMulai = data.tanggalMulai
    ? new Date(data.tanggalMulai)
    : prescription.tanggalMulai;
  const tanggalBerakhir = data.tanggalBerakhir
    ? new Date(data.tanggalBerakhir)
    : prescription.tanggalBerakhir;
  if (tanggalBerakhir < tanggalMulai) return { kind: 'INVALID_DATE_RANGE' as const };

  const updated = await prisma.therapyPrescription.update({
    where: { id },
    data: {
      ...data,
      ...(data.tanggalMulai ? { tanggalMulai } : {}),
      ...(data.tanggalBerakhir ? { tanggalBerakhir } : {}),
    },
    include: { movement: { select: movementWithMediaSelect } },
  });
  return {
    kind: 'UPDATED' as const,
    data: {
      ...updated,
      movement: serializeMovement(updated.movement),
    },
  };
};

export const deletePrescription = async (userId: string, id: string) => {
  const prescription = await prisma.therapyPrescription.findUnique({
    where: { id },
    select: { patientId: true },
  });
  if (!prescription) return 'NOT_FOUND' as const;

  const patient = await prisma.patientProfile.findFirst({
    where: { id: prescription.patientId, nakes: { userId } },
    select: { id: true },
  });
  if (!patient) return 'NOT_FOUND' as const;

  try {
    await prisma.therapyPrescription.delete({ where: { id } });
    return 'DELETED' as const;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return 'NOT_FOUND' as const;
    }
    throw error;
  }
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
      therapyType: data.therapyType,
      estimatedAngle: data.estimatedAngle,
      validRepetitions: data.validRepetitions,
      durationMs: data.durationMs,
      sampleCount: data.sampleCount,
      performedAt: new Date(data.performedAt),
    },
  });
};