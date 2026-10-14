  import { randomInt } from 'node:crypto';
  import { Prisma } from '@prisma/client';
  import type { z } from 'zod';
  import prisma from '../prisma';
  import type { updatePatientClinicalDataSchema } from '../utils/validations/connection.validation';

  type PatientClinicalData = z.infer<typeof updatePatientClinicalDataSchema>;

  const CODE_TTL_MS = 10 * 60 * 1000;
  const CODE_GENERATION_ATTEMPTS = 5;

  type ConnectionErrorCode =
    | 'PATIENT_PROFILE_NOT_FOUND'
    | 'NAKES_PROFILE_NOT_FOUND'
    | 'PATIENT_ALREADY_CONNECTED'
    | 'INVALID_OR_EXPIRED_CODE'
    | 'PATIENT_NOT_FOUND_OR_NOT_ASSIGNED';

  export class ConnectionServiceError extends Error {
    constructor(
      public readonly code: ConnectionErrorCode,
      message: string,
    ) {
      super(message);
      this.name = 'ConnectionServiceError';
    }
  }

  const isUniqueConstraintError = (error: unknown): boolean =>
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';

  export const createPatientConnectionCode = async (userId: string) => {
    const patient = await prisma.patientProfile.findUnique({
      where: { userId },
      select: { id: true, nakesId: true },
    });

    if (!patient) {
      throw new ConnectionServiceError(
        'PATIENT_PROFILE_NOT_FOUND',
        'Profil pasien tidak ditemukan',
      );
    }
    if (patient.nakesId) {
      throw new ConnectionServiceError(
        'PATIENT_ALREADY_CONNECTED',
        'Pasien sudah terhubung dengan nakes',
      );
    }

    for (let attempt = 0; attempt < CODE_GENERATION_ATTEMPTS; attempt += 1) {
      const code = randomInt(100000, 1000000).toString();
      const expiresAt = new Date(Date.now() + CODE_TTL_MS);

      try {
        const result = await prisma.patientProfile.updateMany({
          where: { id: patient.id, nakesId: null },
          data: { connectionCode: code, connectionCodeExpiresAt: expiresAt },
        });

        if (result.count !== 1) {
          throw new ConnectionServiceError(
            'PATIENT_ALREADY_CONNECTED',
            'Pasien sudah terhubung dengan nakes',
          );
        }

        return { code, expiresAt };
      } catch (error) {
        if (isUniqueConstraintError(error)) continue;
        throw error;
      }
    }

    throw new Error('Gagal membuat kode penghubung unik');
  };

  export const getPatientConnection = async (userId: string) => {
    const patient = await prisma.patientProfile.findUnique({
      where: { userId },
      select: {
        nakes: { select: { namaLengkap: true } },
      },
    });

    if (!patient) {
      throw new ConnectionServiceError(
        'PATIENT_PROFILE_NOT_FOUND',
        'Profil pasien tidak ditemukan',
      );
    }

    return {
      connected: patient.nakes !== null,
      nakes: patient.nakes,
    };
  };

  export const connectPatientWithCode = async (userId: string, code: string) => {
    const nakes = await prisma.nakesProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!nakes) {
      throw new ConnectionServiceError(
        'NAKES_PROFILE_NOT_FOUND',
        'Profil nakes tidak ditemukan',
      );
    }

    return prisma.$transaction(async (transaction) => {
      const patient = await transaction.patientProfile.findUnique({
        where: { connectionCode: code },
        select: { id: true, namaLengkap: true, connectionCodeExpiresAt: true },
      });
      const now = new Date();

      if (!patient || !patient.connectionCodeExpiresAt || patient.connectionCodeExpiresAt <= now) {
        throw new ConnectionServiceError(
          'INVALID_OR_EXPIRED_CODE',
          'Kode tidak valid atau sudah kedaluwarsa',
        );
      }

      const result = await transaction.patientProfile.updateMany({
        where: {
          id: patient.id,
          nakesId: null,
          connectionCode: code,
          connectionCodeExpiresAt: { gt: now },
        },
        data: {
          nakesId: nakes.id,
          connectionCode: null,
          connectionCodeExpiresAt: null,
        },
      });

      if (result.count !== 1) {
        throw new ConnectionServiceError(
          'INVALID_OR_EXPIRED_CODE',
          'Kode tidak valid atau sudah kedaluwarsa',
        );
      }
      return { id: patient.id, namaLengkap: patient.namaLengkap };
    });
  };

  export const updatePatientClinicalData = async (
    nakesUserId: string,
    patientId: string,
    data: PatientClinicalData,
  ) => {
    const result = await prisma.patientProfile.updateMany({
      where: { id: patientId, nakes: { userId: nakesUserId } },
      data,
    });

    if (result.count !== 1) {
      throw new ConnectionServiceError(
        'PATIENT_NOT_FOUND_OR_NOT_ASSIGNED',
        'Pasien tidak ditemukan atau bukan pasien binaan Anda',
      );
    }

    return prisma.patientProfile.findUniqueOrThrow({
      where: { id: patientId },
      select: {
        id: true,
        kondisiMedis: true,
        riwayatPenyakit: true,
        alergi: true,
        lokasiKeluhan: true,
        tanggalMulaiKeluhan: true,
        skalaNyeri: true,
        catatanAwal: true,
      },
    });
  };
