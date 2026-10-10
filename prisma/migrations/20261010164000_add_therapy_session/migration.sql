CREATE TABLE IF NOT EXISTS "TherapyMovement" (
    "id" TEXT NOT NULL,
    "namaGerakan" TEXT NOT NULL,
    "deskripsi" TEXT,
    "instruksi" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "mediaType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TherapyMovement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TherapyPrescription" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "nakesId" TEXT NOT NULL,
    "movementId" TEXT NOT NULL,
    "targetRepetisi" INTEGER NOT NULL,
    "frekuensiPerHari" INTEGER NOT NULL,
    "tanggalMulai" TIMESTAMP(3) NOT NULL,
    "tanggalBerakhir" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TherapyPrescription_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'TherapyPrescription_movementId_fkey'
    ) THEN
        ALTER TABLE "TherapyPrescription"
            ADD CONSTRAINT "TherapyPrescription_movementId_fkey"
            FOREIGN KEY ("movementId") REFERENCES "TherapyMovement"("id")
            ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

CREATE TABLE "TherapySession" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "prescriptionId" TEXT,
    "programName" TEXT NOT NULL,
    "estimatedAngle" DOUBLE PRECISION NOT NULL,
    "validRepetitions" INTEGER NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "sampleCount" INTEGER NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TherapySession_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TherapySession_patientId_performedAt_idx"
    ON "TherapySession"("patientId", "performedAt");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'TherapySession_patientId_fkey'
    ) THEN
        ALTER TABLE "TherapySession"
            ADD CONSTRAINT "TherapySession_patientId_fkey"
            FOREIGN KEY ("patientId") REFERENCES "PatientProfile"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'TherapySession_prescriptionId_fkey'
    ) THEN
        ALTER TABLE "TherapySession"
            ADD CONSTRAINT "TherapySession_prescriptionId_fkey"
            FOREIGN KEY ("prescriptionId") REFERENCES "TherapyPrescription"("id")
            ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
