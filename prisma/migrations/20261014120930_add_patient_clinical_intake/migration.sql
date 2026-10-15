-- AlterTable
ALTER TABLE "PatientProfile" ADD COLUMN     "alergi" TEXT,
ADD COLUMN     "lokasiKeluhan" TEXT,
ADD COLUMN     "riwayatPenyakit" TEXT,
ADD COLUMN     "sisiTubuh" TEXT,
ADD COLUMN     "skalaNyeri" INTEGER,
ADD COLUMN     "tanggalMulaiKeluhan" TIMESTAMP(3);
