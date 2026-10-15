import { PrismaClient, Role, JenisKelamin } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Memulai proses seeding...');

  await prisma.medicationLog.deleteMany();
  await prisma.medicationSchedule.deleteMany();
  await prisma.therapyPrescription.deleteMany();
  await prisma.therapyMovement.deleteMany();
  await prisma.patientProfile.deleteMany();
  await prisma.nakesProfile.deleteMany();
  await prisma.user.deleteMany();

  const dummyPassword = await bcrypt.hash('password123', 10);

  await prisma.user.create({
    data: {
      email: 'dr.budi@connect.com',
      password: dummyPassword,
      role: Role.NAKES,
      nakesProfile: {
        create: {
          namaLengkap: 'Dr. Budi Santoso, S.Ft',
          spesialisasi: 'Fisioterapi Olahraga',
          nomorRegis: 'STR-FT-987654321',
          faskes: 'Klinik Fisioterapi Sehat',
          nomorTelepon: '081234567890',
        }
      }
    }
  });

  const farel = await prisma.user.create({
    data: {
      email: 'farrel@connect.com',
      password: dummyPassword,
      role: Role.PATIENT,
      patientProfile: {
        create: {
          namaLengkap: 'Farrel Diego Akbar',
          tanggalLahir: new Date('2008-04-15T00:00:00Z'),
          jenisKelamin: JenisKelamin.LAKI_LAKI,
          nomorTelepon: '089876543210',
          alamat: 'Balikpapan, Kalimantan Timur',
          kondisiMedis: 'Pemulihan pasca cedera pergelangan kaki',
          catatanAwal: 'Pasien kooperatif, perlu penguatan otot ankle.',
        }
      }
    },
    include: {
      patientProfile: true
    }
  });

    const fathur = await prisma.user.create({
    data: {
      email: 'fathur@connect.com',
      password: dummyPassword,
      role: Role.PATIENT,
      patientProfile: {
        create: {
          namaLengkap: 'Fathur Rahman',
          tanggalLahir: new Date('2008-04-15T00:00:00Z'),
          jenisKelamin: JenisKelamin.LAKI_LAKI,
          nomorTelepon: '089876543210',
          alamat: 'Balikpapan, Kalimantan Timur',
          kondisiMedis: 'Pemulihan pasca cedera pergelangan kaki',
          catatanAwal: 'Pasien kooperatif, perlu penguatan otot ankle.',
        }
      }
    },
    include: {
      patientProfile: true
    }
  });
}

main()
  .catch((e) => {
    console.error('Terjadi kesalahan saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });