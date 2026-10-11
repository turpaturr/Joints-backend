import prisma from '../prisma';

// ==========================================
// FITUR NAKES
// ==========================================
export const createMedicationSchedule = async (userId: string, data: any) => {
  // 1. Cari NakesProfile milik user yang sedang login
  const nakes = await prisma.nakesProfile.findUnique({
    where: { userId: userId }
  });

  if (!nakes) throw new Error('Profil Nakes tidak ditemukan');

  const schedule = await prisma.medicationSchedule.create({
    data: {
      nakesId: nakes.id, // Gunakan ID dari NakesProfile, BUKAN User ID
      patientId: data.patientId,
      medicationName: data.medicationName,
      dosage: data.dosage,
      frequency: data.frequency,
      timeToTake: data.timeToTake, 
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    },
  });
  return schedule;
};


// ==========================================
// FITUR PASIEN
// ==========================================
export const getPatientMedications = async (userId: string) => {
  // Cari PatientProfile milik user yang sedang login
  const patient = await prisma.patientProfile.findUnique({
    where: { userId: userId }
  });

  if (!patient) throw new Error('Profil Pasien tidak ditemukan');

  const schedules = await prisma.medicationSchedule.findMany({
    where: { patientId: patient.id }, // Gunakan ID PatientProfile
    include: {
      logs: {
        orderBy: { takenAt: 'desc' },
        take: 5 
      }
    }
  });
  return schedules;
};

export const logMedicationTaken = async (userId: string, scheduleId: string) => {
  // Cari PatientProfile milik user yang sedang login
  const patient = await prisma.patientProfile.findUnique({
    where: { userId: userId }
  });

  if (!patient) throw new Error('Profil Pasien tidak ditemukan');

  const schedule = await prisma.medicationSchedule.findUnique({
    where: { id: scheduleId }
  });

  if (!schedule || schedule.patientId !== patient.id) {
    throw new Error('UNAUTHORIZED_ACCESS');
  }

  const log = await prisma.medicationLog.create({
    data: {
      scheduleId,
      patientId: patient.id, // Gunakan ID PatientProfile
      status: 'TAKEN',
      takenAt: new Date(),
    },
  });
  return log;
};