import { PrismaClient, Role, JenisKelamin } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Memulai proses seeding...');

  // Hapus data lama (opsional, agar tidak duplikat jika dijalankan ulang)
  await prisma.medicationLog.deleteMany();
  await prisma.medicationSchedule.deleteMany();
  await prisma.therapyPrescription.deleteMany();
  await prisma.therapyMovement.deleteMany();
  await prisma.patientProfile.deleteMany();
  await prisma.nakesProfile.deleteMany();
  await prisma.user.deleteMany();

  // Dummy password (sebaiknya gunakan bcrypt.hashSync('password123', 10) jika di production)
  const dummyPassword = await bcrypt.hash('password123', 10);

  // 1. Buat Data Nakes
  const nakesUser = await prisma.user.create({
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
    },
    include: {
      nakesProfile: true
    }
  });

  // 2. Buat Data Pasien
  const patientUser = await prisma.user.create({
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
          nakesId: nakesUser.nakesProfile?.id // Relasikan dengan Nakes di atas
        }
      }
    },
    include: {
      patientProfile: true
    }
  });

  // 3. Buat Data Gerakan Terapi (Master Data)
  const movement = await prisma.therapyMovement.create({
    data: {
      namaGerakan: 'Ankle Dorsiflexion',
      deskripsi: 'Gerakan menarik telapak kaki ke arah tulang kering.',
      instruksi: '1. Duduk dengan kaki lurus.\n2. Tarik telapak kaki ke arah tubuh sejauh mungkin.\n3. Tahan 3 detik, lalu rileks.',
      mediaType: 'VIDEO',
      mediaUrl: 'https://example.com/videos/ankle-dorsiflexion.mp4'
    }
  });

  // 4. Buat Resep Terapi untuk Pasien
  await prisma.therapyPrescription.create({
    data: {
      patientId: patientUser.patientProfile!.id,
      nakesId: nakesUser.nakesProfile!.id,
      movementId: movement.id,
      targetRepetisi: 10,
      frekuensiPerHari: 2, // 2 kali sehari
      tanggalMulai: new Date(),
      tanggalBerakhir: new Date(new Date().setDate(new Date().getDate() + 14)), // 14 hari ke depan
    }
  });

  // 5. Buat Jadwal Obat
  const schedule = await prisma.medicationSchedule.create({
    data: {
      patientId: patientUser.patientProfile!.id,
      nakesId: nakesUser.nakesProfile!.id,
      medicationName: 'Ibuprofen',
      dosage: '400mg',
      frequency: '2x sehari sesudah makan',
      timeToTake: ['08:00', '20:00'],
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 5)), // 5 hari ke depan
    }
  });

  // 6. Buat Log Obat (Skenario Pasien sudah minum obat pagi ini)
  await prisma.medicationLog.create({
    data: {
      scheduleId: schedule.id,
      patientId: patientUser.patientProfile!.id,
      status: 'TAKEN',
      takenAt: new Date()
    }
  });

  console.log('Seeding selesai! Data dummy berhasil dimasukkan ke database.');
}

main()
  .catch((e) => {
    console.error('Terjadi kesalahan saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });