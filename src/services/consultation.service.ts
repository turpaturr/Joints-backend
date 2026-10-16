import { ConsultationStatus } from '@prisma/client';
import prisma from '../prisma';

export type ConsultationErrorCode =
  | 'PATIENT_PROFILE_NOT_FOUND'
  | 'NAKES_PROFILE_NOT_FOUND'
  | 'PATIENT_NOT_CONNECTED'
  | 'CONSULTATION_NOT_FOUND'
  | 'FORBIDDEN_ACCESS';

export class ConsultationServiceError extends Error {
  constructor(
    public readonly code: ConsultationErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'ConsultationServiceError';
  }
}

export interface CreateConsultationInput {
  subject: string;
  description: string;
  location?: string | null;
  painScale?: number | null;
  symptomStartedAt?: Date | null;
}

export interface RespondConsultationInput {
  response: string;
  status?: ConsultationStatus;
}

export interface ConsultationFilter {
  status?: ConsultationStatus;
  patientId?: string;
}

export const createConsultation = async (
  userId: string,
  data: CreateConsultationInput,
) => {
  const patient = await prisma.patientProfile.findUnique({
    where: { userId },
    select: { id: true, nakesId: true },
  });

  if (!patient) {
    throw new ConsultationServiceError(
      'PATIENT_PROFILE_NOT_FOUND',
      'Profil pasien tidak ditemukan',
    );
  }

  if (!patient.nakesId) {
    throw new ConsultationServiceError(
      'PATIENT_NOT_CONNECTED',
      'Pasien belum terhubung dengan Nakes/dokter. Silakan hubungkan akun terlebih dahulu.',
    );
  }

  const consultation = await prisma.consultation.create({
    data: {
      patientId: patient.id,
      nakesId: patient.nakesId,
      subject: data.subject,
      description: data.description,
      location: data.location ?? null,
      painScale: data.painScale ?? null,
      symptomStartedAt: data.symptomStartedAt ?? null,
      status: 'PENDING',
    },
    include: {
      patient: {
        select: {
          id: true,
          namaLengkap: true,
        },
      },
      nakes: {
        select: {
          id: true,
          namaLengkap: true,
          spesialisasi: true,
          faskes: true,
        },
      },
    },
  });

  return consultation;
};

export const getConsultations = async (
  userId: string,
  role: string,
  filters?: ConsultationFilter,
) => {
  if (role === 'PATIENT') {
    const patient = await prisma.patientProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!patient) {
      throw new ConsultationServiceError(
        'PATIENT_PROFILE_NOT_FOUND',
        'Profil pasien tidak ditemukan',
      );
    }

    return prisma.consultation.findMany({
      where: {
        patientId: patient.id,
        ...(filters?.status ? { status: filters.status } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        nakes: {
          select: {
            id: true,
            namaLengkap: true,
            spesialisasi: true,
            faskes: true,
          },
        },
      },
    });
  }

  if (role === 'NAKES') {
    const nakes = await prisma.nakesProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!nakes) {
      throw new ConsultationServiceError(
        'NAKES_PROFILE_NOT_FOUND',
        'Profil nakes tidak ditemukan',
      );
    }

    return prisma.consultation.findMany({
      where: {
        nakesId: nakes.id,
        ...(filters?.status ? { status: filters.status } : {}),
        ...(filters?.patientId ? { patientId: filters.patientId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        patient: {
          select: {
            id: true,
            namaLengkap: true,
            kondisiMedis: true,
            nomorTelepon: true,
          },
        },
      },
    });
  }

  throw new ConsultationServiceError(
    'FORBIDDEN_ACCESS',
    'Role tidak valid untuk melihat konsultasi',
  );
};

export const getConsultationById = async (
  userId: string,
  role: string,
  consultationId: string,
) => {
  const consultation = await prisma.consultation.findUnique({
    where: { id: consultationId },
    include: {
      patient: {
        select: {
          id: true,
          userId: true,
          namaLengkap: true,
          kondisiMedis: true,
          nomorTelepon: true,
          lokasiKeluhan: true,
        },
      },
      nakes: {
        select: {
          id: true,
          userId: true,
          namaLengkap: true,
          spesialisasi: true,
          faskes: true,
          nomorTelepon: true,
        },
      },
    },
  });

  if (!consultation) {
    throw new ConsultationServiceError(
      'CONSULTATION_NOT_FOUND',
      'Laporan konsultasi tidak ditemukan',
    );
  }

  if (role === 'PATIENT' && consultation.patient.userId !== userId) {
    throw new ConsultationServiceError(
      'FORBIDDEN_ACCESS',
      'Anda tidak memiliki akses ke konsultasi ini',
    );
  }

  if (role === 'NAKES' && consultation.nakes.userId !== userId) {
    throw new ConsultationServiceError(
      'FORBIDDEN_ACCESS',
      'Anda tidak memiliki akses ke konsultasi ini',
    );
  }

  return consultation;
};

export const respondConsultation = async (
  nakesUserId: string,
  consultationId: string,
  data: RespondConsultationInput,
) => {
  const nakes = await prisma.nakesProfile.findUnique({
    where: { userId: nakesUserId },
    select: { id: true },
  });

  if (!nakes) {
    throw new ConsultationServiceError(
      'NAKES_PROFILE_NOT_FOUND',
      'Profil nakes tidak ditemukan',
    );
  }

  const existing = await prisma.consultation.findUnique({
    where: { id: consultationId },
  });

  if (!existing) {
    throw new ConsultationServiceError(
      'CONSULTATION_NOT_FOUND',
      'Laporan konsultasi tidak ditemukan',
    );
  }

  if (existing.nakesId !== nakes.id) {
    throw new ConsultationServiceError(
      'FORBIDDEN_ACCESS',
      'Anda tidak memiliki wewenang untuk menindaklanjuti konsultasi pasien ini',
    );
  }

  const newStatus =
    data.status ||
    (existing.status === 'PENDING' ? 'IN_PROGRESS' : existing.status);

  const resolvedAt =
    newStatus === 'RESOLVED'
      ? existing.resolvedAt || new Date()
      : data.status && data.status !== 'RESOLVED'
        ? null
        : existing.resolvedAt;

  const updated = await prisma.consultation.update({
    where: { id: consultationId },
    data: {
      response: data.response,
      status: newStatus,
      resolvedAt,
    },
    include: {
      patient: {
        select: {
          id: true,
          namaLengkap: true,
          kondisiMedis: true,
        },
      },
      nakes: {
        select: {
          id: true,
          namaLengkap: true,
          spesialisasi: true,
          faskes: true,
        },
      },
    },
  });

  return updated;
};

export const updateConsultationStatus = async (
  nakesUserId: string,
  consultationId: string,
  status: ConsultationStatus,
) => {
  const nakes = await prisma.nakesProfile.findUnique({
    where: { userId: nakesUserId },
    select: { id: true },
  });

  if (!nakes) {
    throw new ConsultationServiceError(
      'NAKES_PROFILE_NOT_FOUND',
      'Profil nakes tidak ditemukan',
    );
  }

  const existing = await prisma.consultation.findUnique({
    where: { id: consultationId },
  });

  if (!existing) {
    throw new ConsultationServiceError(
      'CONSULTATION_NOT_FOUND',
      'Laporan konsultasi tidak ditemukan',
    );
  }

  if (existing.nakesId !== nakes.id) {
    throw new ConsultationServiceError(
      'FORBIDDEN_ACCESS',
      'Anda tidak memiliki wewenang untuk memperbarui status konsultasi pasien ini',
    );
  }

  const resolvedAt =
    status === 'RESOLVED'
      ? existing.resolvedAt || new Date()
      : null;

  const updated = await prisma.consultation.update({
    where: { id: consultationId },
    data: {
      status,
      resolvedAt,
    },
    include: {
      patient: {
        select: {
          id: true,
          namaLengkap: true,
          kondisiMedis: true,
        },
      },
      nakes: {
        select: {
          id: true,
          namaLengkap: true,
          spesialisasi: true,
          faskes: true,
        },
      },
    },
  });

  return updated;
};

