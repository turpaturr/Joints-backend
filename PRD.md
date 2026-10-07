# PRD — Connect

**Product Requirements Document**  
**Versi:** 0.2 (Updated Tech Stack & Layered Architecture)  
**Status:** Draft / Active Development  

---

## 1. Ringkasan Produk

**Nama Proyek:** Connect

**Deskripsi:**  
Connect adalah aplikasi yang menjembatani pasien fisioterapi mandiri di rumah dengan tenaga kesehatan (nakes) yang menanganinya. Aplikasi ini memastikan nakes dapat memonitoring secara objektif apakah pasien benar-benar menjalani terapi sesuai jadwal, serta membantu pasien menilai kebenaran gerakan terapi secara real-time lewat sensor gyroscope pada smartphone.

**Masalah yang Diselesaikan:**
- Nakes tidak punya visibilitas terhadap kepatuhan dan kebenaran gerakan pasien yang menjalani fisioterapi mandiri di rumah.
- Pasien tidak punya cara mengetahui apakah gerakan terapi yang mereka lakukan sendiri sudah benar.
- Komunikasi keluhan lanjutan dari pasien ke nakes tidak terstruktur dan memakan waktu konsultasi.

---

## 2. Target Pengguna

**Target utama:** Fasilitas kesehatan di Indonesia (puskesmas, klinik fisioterapi, rumah sakit) beserta pasien rawat jalan/rawat mandiri yang menjalani program fisioterapi di rumah.

**Dua Role Pengguna:**
| Role | Deskripsi |
|---|---|
| **Pasien** | Pengguna yang menjalani program fisioterapi mandiri di rumah |
| **Nakes** | Tenaga kesehatan (dokter/fisioterapis) yang memberi resep terapi dan memonitoring progres pasien |

---

## 3. Tujuan Produk

- Memberi nakes data objektif dan terukur mengenai kepatuhan serta kualitas gerakan terapi pasien di rumah.
- Memberi pasien panduan real-time agar gerakan terapi yang dilakukan sendiri sesuai anjuran.
- Menyederhanakan komunikasi keluhan pasien ke nakes lewat perantara AI, tanpa menggantikan keputusan medis nakes.

---

## 4. Fitur Utama

### 4.1 Autentikasi & Authorization
- Login/register dengan dua role (`PATIENT` & `NAKES`) menggunakan JWT (JSON Web Tokens).
- Middleware penanganan Role-Based Access Control (RBAC).

---

### 4.2 Fitur Pasien

| # | Fitur | Deskripsi |
|---|---|---|
| P1 | **Pendeteksi Gerakan Berbasis Gyroscope** | Sensor gyroscope membaca sudut gerakan secara real-time dan memberi umpan balik apakah gerakan sesuai target yang ditentukan nakes. Hasil rekaman dikirim ke backend. |
| P2 | **Jadwal Minum Obat** | Pengingat jadwal minum obat sesuai resep nakes, dengan konfirmasi (*log*) dari pasien setelah diminum. |
| P3 | **Jadwal Terapi** | Pengingat jadwal sesi terapi yang harus dilakukan sesuai resep nakes. |
| P4 | **Riwayat Terapi** | Log hasil terapi (sudut yang dicapai, jumlah repetisi valid, tren kemajuan) dari data gyroscope. |
| P5 | **Catatan Nakes untuk Pasien** | Pasien dapat membaca catatan/arahan dari nakes. |
| P6 | **AI Chatbot Penjembatan** | Pasien menyampaikan keluhan lewat chat dengan AI (Gemini API). AI merangkum percakapan menjadi ringkasan terstruktur dan mengirimkannya ke dashboard nakes. |

---

### 4.3 Fitur Nakes

| # | Fitur | Deskripsi |
|---|---|---|
| N1 | **Dashboard Analitik** | Menampilkan data pemantauan seluruh pasien binaan: kepatuhan jadwal terapi, kepatuhan obat, dan tren kemajuan gerakan dari data gyroscope. |
| N2 | **Catatan Nakes untuk Pasien** | Nakes menuliskan catatan, arahan, atau penyesuaian terapi untuk pasien. |
| N3 | **Menjawab Keluhan Lanjutan** | Nakes membaca ringkasan keluhan pasien buatan AI, lalu memberikan jawaban/saran lanjutan. |

---

## 5. Alur Pengguna (User Flow) Singkat

**Alur Pasien:**
1. Login sebagai Pasien.
2. Lihat jadwal terapi & obat hari ini.
3. Jalankan sesi terapi → tempel HP → sistem baca gyroscope → feedback real-time → simpan sesi via REST API (`/therapy-sessions`).
4. (Opsional) Chat dengan AI jika ada keluhan → AI merangkum → tersimpan ke DB.
5. Lihat catatan & umpan balik dari nakes.

**Alur Nakes:**
1. Login sebagai Nakes.
2. Lihat dashboard analitik seluruh pasien binaan.
3. Buka profil pasien → lihat riwayat terapi, kepatuhan, dan ringkasan keluhan dari AI.
4. Tuliskan catatan/arahan atau jawab keluhan pasien.

---

## 6. Batasan dan Disclaimer

- Aplikasi ini adalah **alat bantu pemantauan**, bukan alat diagnosis.
- AI chatbot **tidak memberikan diagnosis/saran medis langsung**, hanya merangkum keluhan pasien untuk nakes.
- Hasil deteksi gyroscope adalah estimasi sudut gerakan (bukan goniometer medis presisi).
- Resep terapi sepenuhnya ditentukan oleh nakes.

---

## 7. Tech Stack & Software Architecture

### 7.1 Backend Stack
- **Runtime:** Node.js (v18+ / v20+)
- **Framework:** Express.js + TypeScript
- **ORM:** Prisma ORM
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens) & Bcrypt (Password Hashing)
- **Validation:** Zod (Schema validation untuk Request Body/Params)
- **AI Integration:** Google Generative AI SDK (Gemini API)

---

### 7.2 Best Practice Architecture: Layered Architecture

Untuk menjaga pemisahan logika (*separation of concerns*) agar *codebase* mudah di-maintain, di-test, dan di-scale, arsitektur backend Express.js dibagi menjadi beberapa *layer*:

```text
.
├── prisma/
│   └── schema.prisma         # Definisi Prisma Schema & DB Migration setup
├── src/
│   ├── controllers/          # Express Request & Response handling (HTTP Layer)
│   ├── middleware/           # Express Middlewares (Auth JWT, Role Guard, Error Handler, Validation)
│   ├── prisma/               # Prisma Client instance/singleton (client.ts atau index.ts)
│   ├── routes/               # Express Routes (API Endpoint Routing definitions)
│   ├── services/             # Business Logic Layer & Integrasi External (Gemini AI, kalkulasi data)
│   ├── utils/                # Helper functions, custom error classes, response formatters, loggers
│   ├── app.ts                # Express app configuration & middleware binding
│   └── server.ts             # Entry point untuk menjalankan server (listen port)
├── .env                      # TIDAK PERNAH di-commit
├── .gitignore
├── AGENTS.md                 # Dokumentasi panduan AI Agent ini
├── package.json
├── PRD.md                    # Product Requirements Document
└── tsconfig.json
```

#### Deskripsi Peran Setiap Layer:
1. **Controllers Layer:** Mengambil parameter/body dari HTTP Request, memanggil *Service*, dan mengembalikan HTTP Response. **TIDAK BOLEH** berisi logika bisnis atau query database langsung.
2. **Services Layer:** Menampung seluruh logika bisnis utama (misal: kalkulasi kepatuhan terapi, pemrosesan prompt ke Gemini API, verifikasi rule bisnis).
3. **Repositories Layer:** Bertanggung jawab penuh terhadap interaksi database menggunakan Prisma Client (`prisma.user.findUnique`, `prisma.session.create`, dll).
4. **Schemas Layer (Zod):** Memvalidasi input request dari client sebelum diproses oleh controller/service.

---

## 8. Skema Data (Prisma Schema Reference)

Ringkasan entitas database PostgreSQL yang dimodelkan melalui Prisma ORM:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  PATIENT
  NAKES
}

model User {
  id            String          @id @default(uuid())
  email         String          @unique
  password      String
  role          Role
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  patientProfile PatientProfile?
  nakesProfile   NakesProfile?
}

model PatientProfile {
  id                   String               @id @default(uuid())
  userId               String               @unique
  user                 User                 @relation(fields: [userId], references: [id])
  fullName             String
  assignedNakesId      String?
  assignedNakes        NakesProfile?        @relation("NakesToPatient", fields: [assignedNakesId], references: [id])
  
  prescriptions        TherapyPrescription[]
  therapySessions      TherapySession[]
  medicationSchedules  MedicationSchedule[]
  nakesNotes           NakesNote[]
  chatSummaries        ChatSummary[]
}

model NakesProfile {
  id            String           @id @default(uuid())
  userId        String           @unique
  user          User             @relation(fields: [userId], references: [id])
  fullName      String
  patients      PatientProfile[] @relation("NakesToPatient")
  nakesNotes    NakesNote[]
}

model TherapyPrescription {
  id              String           @id @default(uuid())
  patientId       String
  patient         PatientProfile   @relation(fields: [patientId], references: [id])
  movementType    String
  targetAngle     Float
  targetReps      Int
  frequencyPerDay Int
  startDate       DateTime
  endDate         DateTime
  therapySessions TherapySession[]
}

model TherapySession {
  id              String              @id @default(uuid())
  prescriptionId  String
  prescription    TherapyPrescription @relation(fields: [prescriptionId], references: [id])
  patientId       String
  patient         PatientProfile      @relation(fields: [patientId], references: [id])
  achievedAngle   Float
  validReps       Int
  durationSeconds Int
  performedAt     DateTime            @default(now())
}

model MedicationSchedule {
  id           String          @id @default(uuid())
  patientId    String
  patient      PatientProfile  @relation(fields: [patientId], references: [id])
  medicineName String
  dosage       String
  scheduledTime String         // e.g. "08:00"
  logs         MedicationLog[]
}

model MedicationLog {
  id         String             @id @default(uuid())
  scheduleId String
  schedule   MedicationSchedule @relation(fields: [scheduleId], references: [id])
  takenAt    DateTime           @default(now())
  isTaken    Boolean            @default(true)
}

model NakesNote {
  id        String         @id @default(uuid())
  patientId String
  patient   PatientProfile @relation(fields: [patientId], references: [id])
  nakesId   String
  nakes     NakesProfile   @relation(fields: [nakesId], references: [id])
  content   String
  createdAt DateTime       @default(now())
}

model ChatSummary {
  id            String         @id @default(uuid())
  patientId     String
  patient       PatientProfile @relation(fields: [patientId], references: [id])
  rawChat       Json           // Menyimpan log percakapan pasien dengan AI
  aiSummary     String         // Hasil ringkasan keluhan buatan Gemini AI
  nakesResponse String?        // Jawaban/saran balasan dari nakes
  createdAt     DateTime       @default(now())
}
```

---

## 9. Out of Scope

- Integrasi dengan sistem kesehatan nasional (SATUSEHAT).
- Modul skrining penyakit lain di luar fisioterapi.
- Akses untuk caregiver/keluarga.
- Push Notifications otomatis real-time (nakes mengecek dashboard secara manual/berkala).

---

## 10. Metrik Keberhasilan

- Jumlah sesi terapi yang berhasil direkam dan tervalidasi gyroscope.
- Tingkat kepatuhan jadwal terapi & obat pasien.
- Waktu respons nakes terhadap ringkasan keluhan dari AI.