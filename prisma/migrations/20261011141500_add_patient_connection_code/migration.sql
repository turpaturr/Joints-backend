ALTER TABLE "PatientProfile"
ADD COLUMN "connectionCode" TEXT,
ADD COLUMN "connectionCodeExpiresAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "PatientProfile_connectionCode_key"
ON "PatientProfile"("connectionCode");
