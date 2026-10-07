# PRD — Connect

**Product Requirements Document**

**Versi:** 0.3  
**Status:** Draft / Active Development

---

## 1. Ringkasan Produk

### 1.1 Nama Proyek

**Connect**

### 1.2 Deskripsi

Connect adalah aplikasi backend yang menjembatani pasien fisioterapi mandiri di rumah dengan tenaga kesehatan (Nakes) yang menanganinya.

Aplikasi memungkinkan Nakes memonitor kepatuhan pasien terhadap program terapi, sementara pasien mendapatkan bantuan untuk melakukan gerakan terapi sesuai instruksi melalui sensor gyroscope pada smartphone.

Connect juga menyediakan komunikasi berbasis AI untuk membantu pasien menyampaikan keluhan secara lebih terstruktur kepada Nakes.

### 1.3 Masalah yang Diselesaikan

- Nakes tidak memiliki visibilitas terhadap kepatuhan pasien yang menjalani fisioterapi mandiri di rumah.
- Nakes sulit mengetahui apakah pasien melakukan gerakan terapi sesuai instruksi.
- Pasien tidak memiliki alat bantu untuk mengetahui apakah gerakan terapi yang dilakukan sudah mendekati target yang diberikan Nakes.
- Komunikasi keluhan lanjutan dari pasien kepada Nakes tidak terstruktur dan dapat memakan waktu konsultasi.

---

## 2. Target Pengguna

### 2.1 Target Utama

Fasilitas kesehatan di Indonesia, seperti:

- Puskesmas
- Klinik fisioterapi
- Rumah sakit

Beserta pasien rawat jalan atau pasien yang menjalani program fisioterapi di rumah.

### 2.2 Role Pengguna

| Role | Deskripsi |
|---|---|
| `PATIENT` | Pasien yang menjalani program fisioterapi mandiri di rumah. |
| `NAKES` | Tenaga kesehatan yang memberikan instruksi terapi dan memonitor pasien. |

---

## 3. Tujuan Produk

Connect memiliki tujuan utama:

1. Membantu Nakes memonitor kepatuhan pasien terhadap program terapi.
2. Menyediakan data aktivitas terapi pasien yang dapat digunakan sebagai bahan monitoring.
3. Membantu pasien melakukan gerakan terapi sesuai target yang diberikan Nakes.
4. Membantu pasien mencatat kepatuhan terhadap jadwal obat.
5. Menyederhanakan komunikasi keluhan pasien kepada Nakes.
6. Membantu Nakes mendapatkan ringkasan keluhan pasien tanpa menggantikan keputusan medis.

---

## 4. Fitur Utama

### 4.1 Autentikasi & Authorization

Sistem menyediakan:

- Registrasi pengguna.
- Login pengguna.
- Autentikasi menggunakan JWT.
- Dua role utama:
  - `PATIENT`
  - `NAKES`
- Middleware autentikasi.
- Role-Based Access Control (RBAC).

#### Aturan

Endpoint privat harus memvalidasi JWT sebelum request diteruskan ke controller.

Endpoint tertentu hanya dapat diakses oleh role yang sesuai.

---

## 5. Fitur Pasien

| ID | Fitur | Deskripsi |
|---|---|---|
| P1 | Pendeteksi Gerakan Gyroscope | Membaca data pergerakan dari sensor smartphone untuk membantu pasien melakukan gerakan sesuai target yang diberikan Nakes. |
| P2 | Jadwal Minum Obat | Menampilkan jadwal obat dan memungkinkan pasien mencatat apakah obat telah diminum. |
| P3 | Jadwal Terapi | Menampilkan jadwal terapi yang telah ditentukan oleh Nakes. |
| P4 | Riwayat Terapi | Menampilkan riwayat sesi terapi, termasuk sudut estimasi, repetisi valid, dan durasi. |
| P5 | Catatan Nakes | Pasien dapat membaca catatan atau arahan yang diberikan Nakes. |
| P6 | AI Chatbot | Pasien dapat menyampaikan keluhan kepada AI untuk kemudian dirangkum dan diteruskan kepada Nakes. |

### 5.1 Pendeteksi Gerakan Gyroscope

Sensor gyroscope pada smartphone digunakan untuk membaca perubahan orientasi/pergerakan perangkat.

Sistem dapat menggunakan data tersebut untuk:

- Menghitung estimasi sudut gerakan.
- Membandingkan hasil dengan target terapi.
- Menghitung repetisi yang dianggap valid.
- Mencatat hasil sesi terapi.

> **Catatan:** Data gyroscope merupakan **estimasi pergerakan**, bukan pengukuran medis resmi.

Sistem tidak boleh mengklaim bahwa hasil gyroscope memiliki akurasi setara dengan goniometer medis.

### 5.2 Jadwal Minum Obat

Pasien dapat:

- Melihat daftar obat.
- Melihat jadwal minum.
- Melihat dosis yang diberikan Nakes.
- Menandai obat sebagai telah diminum.

Sistem menyimpan log kepatuhan obat.

> Pembuatan atau perubahan resep obat hanya dapat dilakukan oleh Nakes.

### 5.3 Jadwal Terapi

Pasien dapat melihat:

- Terapi yang harus dilakukan.
- Waktu/frekuensi terapi.
- Target repetisi.
- Target sudut jika ditentukan.
- Periode berlakunya terapi.

Data resep terapi berasal dari Nakes.

### 5.4 Riwayat Terapi

Setiap sesi terapi dapat menyimpan:

- Identitas pasien.
- Resep terapi yang digunakan.
- Estimasi sudut yang dicapai.
- Jumlah repetisi valid.
- Durasi sesi.
- Waktu pelaksanaan.

Data digunakan untuk membantu monitoring perkembangan pasien.

### 5.5 Catatan Nakes

Pasien dapat membaca:

- Catatan Nakes.
- Instruksi terapi.
- Arahan lanjutan.
- Informasi terkait program terapi.

Pasien tidak dapat mengubah atau menghapus catatan tersebut.

### 5.6 AI Chatbot Penjembatan

Pasien dapat menyampaikan keluhan melalui percakapan dengan AI.

AI bertugas:

1. Menggali informasi mengenai keluhan pasien.
2. Membantu menyusun informasi secara lebih terstruktur.
3. Membuat ringkasan keluhan.
4. Menyimpan ringkasan.
5. Mengirimkan ringkasan kepada Nakes.

#### AI Tidak Boleh

AI tidak boleh:

- Memberikan diagnosis.
- Menentukan penyakit.
- Meresepkan obat.
- Menentukan terapi.
- Mengubah resep Nakes.
- Menggantikan keputusan tenaga kesehatan.

AI hanya berfungsi sebagai **intermediary/penghubung informasi** antara pasien dan Nakes.

---

## 6. Fitur Nakes

| ID | Fitur | Deskripsi |
|---|---|---|
| N1 | Dashboard Monitoring | Menampilkan kondisi dan aktivitas pasien yang ditangani. |
| N2 | Manajemen Pasien | Melihat pasien yang berada di bawah tanggung jawab Nakes. |
| N3 | Resep Terapi | Membuat dan mengubah program terapi pasien. |
| N4 | Jadwal Obat | Membuat dan mengubah jadwal obat pasien. |
| N5 | Riwayat Terapi | Melihat hasil sesi terapi pasien. |
| N6 | Catatan Pasien | Membuat catatan atau arahan untuk pasien. |
| N7 | Ringkasan Keluhan AI | Melihat ringkasan keluhan yang dibuat AI. |
| N8 | Respons Keluhan | Memberikan respons terhadap keluhan pasien. |

### 6.1 Dashboard Monitoring

Dashboard Nakes menampilkan informasi pasien yang ditangani, seperti:

- Jumlah pasien.
- Kepatuhan terapi.
- Kepatuhan obat.
- Riwayat sesi terapi.
- Tren hasil terapi.
- Keluhan pasien yang belum ditangani.

### 6.2 Manajemen Pasien

Nakes dapat:

- Melihat pasien yang ditangani.
- Melihat profil pasien.
- Melihat riwayat terapi.
- Melihat kepatuhan pasien.
- Melihat catatan pasien.
- Melihat keluhan yang dikirim pasien.

Pasien hanya dapat diakses oleh Nakes yang memiliki hubungan/assignment dengan pasien tersebut.

### 6.3 Resep Terapi

Nakes dapat membuat dan mengubah:

- Jenis gerakan.
- Target sudut.
- Target repetisi.
- Frekuensi terapi.
- Tanggal mulai.
- Tanggal berakhir.

Pasien hanya memiliki akses untuk membaca resep terapi dan menjalankannya.

### 6.4 Jadwal Obat

Nakes dapat membuat dan mengubah:

- Nama obat.
- Dosis.
- Waktu konsumsi.
- Jadwal penggunaan.

Pasien hanya dapat melihat jadwal dan mencatat kepatuhan.

### 6.5 Catatan Nakes

Nakes dapat membuat catatan untuk pasien.

Catatan minimal memiliki:

- Pasien.
- Nakes.
- Isi catatan.
- Waktu dibuat.

Pasien hanya dapat membaca catatan.

---

## 7. User Flow

### 7.1 Alur Pasien

```text
Login
  ↓
Dashboard Pasien
  ↓
Lihat Jadwal Terapi / Obat
  ↓
Menjalankan Terapi
  ↓
Gyroscope Membaca Pergerakan
  ↓
Feedback Gerakan
  ↓
Simpan Sesi Terapi
  ↓
Riwayat Terapi
```

Jika pasien memiliki keluhan:

```text
Pasien
  ↓
AI Chatbot
  ↓
Penggalian Keluhan
  ↓
Ringkasan AI
  ↓
Database
  ↓
Dashboard Nakes
  ↓
Respons Nakes
```

### 7.2 Alur Nakes

```text
Login
  ↓
Dashboard Nakes
  ↓
Daftar Pasien
  ↓
Pilih Pasien
  ↓
Lihat:
- Riwayat Terapi
- Kepatuhan
- Jadwal Obat
- Catatan
- Keluhan AI
  ↓
Memberikan Arahan / Respons
```

---

## 8. API Architecture

Backend menyediakan REST API untuk client aplikasi.

Struktur endpoint menggunakan resource-based routing.

Contoh struktur:

```text
/api
├── /auth
│   ├── POST /register
│   └── POST /login
│
├── /patients
│   └── GET /me
│
├── /patients/:patientId
│
├── /therapy-prescriptions
│
├── /therapy-sessions
│
├── /medication-schedules
│
├── /medication-logs
│
├── /nakes-notes
│
└── /chat
```

Endpoint final dapat berkembang mengikuti implementasi backend.

### Prinsip API

- Semua endpoint menerima dan mengembalikan JSON.
- Endpoint privat membutuhkan JWT.
- Input divalidasi menggunakan Zod.
- Authorization harus dilakukan sebelum mengakses data pasien.
- Controller tidak boleh melakukan query Prisma secara langsung.

---

## 9. API Response Standard

Response API harus memiliki format yang konsisten.

### Success

```json
{
  "success": true,
  "message": "Request berhasil diproses",
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "message": "Terjadi kesalahan",
  "error": {
    "code": "SOME_ERROR"
  }
}
```

HTTP status code harus digunakan sesuai kondisi request:

| Status | Penggunaan |
|---|---|
| `200` | Request berhasil |
| `201` | Resource berhasil dibuat |
| `400` | Request tidak valid |
| `401` | Belum terautentikasi |
| `403` | Tidak memiliki akses |
| `404` | Resource tidak ditemukan |
| `409` | Konflik data |
| `500` | Internal server error |

---

## 10. Data Ownership & Authorization

Keamanan data pasien merupakan bagian penting dari sistem.

### 10.1 PATIENT

Pasien hanya boleh:

- Membaca data miliknya sendiri.
- Membuat sesi terapi untuk dirinya sendiri.
- Membuat log konsumsi obat untuk dirinya sendiri.
- Mengirim keluhan untuk dirinya sendiri.
- Membaca catatan Nakes miliknya sendiri.

Pasien tidak boleh:

- Membaca data pasien lain.
- Mengubah resep terapi.
- Mengubah resep obat.
- Membuat catatan Nakes.
- Mengakses dashboard Nakes.

### 10.2 NAKES

Nakes hanya boleh mengakses pasien yang menjadi tanggung jawabnya.

Nakes dapat:

- Membaca data pasien yang ditangani.
- Membuat resep terapi.
- Mengubah resep terapi.
- Membuat jadwal obat.
- Mengubah jadwal obat.
- Membuat catatan pasien.
- Membaca dan merespons keluhan pasien.

---

## 11. Tech Stack

### 11.1 Backend

| Layer | Teknologi |
|---|---|
| Runtime | Node.js 18+ |
| Language | TypeScript |
| Framework | Express.js |
| ORM | Prisma ORM |
| Database | PostgreSQL |
| Validation | Zod |
| Authentication | JWT |
| Password Hashing | bcrypt / argon2 |
| AI | Google Generative AI SDK |
| Testing | Jest / Vitest + Supertest |

Dependency inti tidak boleh diganti atau ditambahkan tanpa persetujuan pengguna.

---

## 12. Software Architecture

Connect menggunakan **Layered Architecture**.

Struktur aktual repository:

```text
src/
├── controllers/
├── middleware/
├── prisma/
├── routes/
├── services/
├── utils/
├── app.ts
└── server.ts
```

### 12.1 Routes

`src/routes/`

Bertanggung jawab terhadap:

- Registrasi endpoint.
- Routing request.
- Pemasangan middleware.
- Pengarahan request ke controller.

**Tidak boleh berisi business logic.**

### 12.2 Controllers

`src/controllers/`

Bertanggung jawab terhadap HTTP layer:

```text
Request
   ↓
Controller
   ↓
Service
   ↓
Response
```

Controller:

- Mengambil input request.
- Memanggil service.
- Mengembalikan response.

Controller **tidak boleh melakukan query Prisma secara langsung**.

### 12.3 Services

`src/services/`

Merupakan pusat business logic aplikasi.

Service bertanggung jawab terhadap:

- Business rules.
- Pemrosesan terapi.
- Kalkulasi kepatuhan.
- Pemrosesan data gyroscope.
- Integrasi Gemini AI.
- Query database menggunakan Prisma Client.
- Validasi business logic.

Untuk versi saat ini, **service dapat berkomunikasi langsung dengan Prisma Client** melalui `src/prisma/`.

Repository pattern belum digunakan.

### 12.4 Middleware

`src/middleware/`

Berisi middleware seperti:

- JWT authentication.
- Role authorization.
- Request validation.
- Global error handling.
- Middleware lainnya.

### 12.5 Prisma

`src/prisma/`

Berisi instance Prisma Client yang digunakan kembali oleh seluruh service.

Tujuannya untuk mencegah pembuatan koneksi Prisma secara berulang.

### 12.6 Utils

`src/utils/`

Berisi helper yang bersifat reusable, seperti:

- JWT helper.
- Password hashing.
- API response formatter.
- Custom error.
- Logger.
- Helper lainnya.

### 12.7 Application Entry

#### `src/app.ts`

Bertanggung jawab terhadap konfigurasi Express application:

- Middleware global.
- Routes.
- Error handler.
- JSON parser.
- Konfigurasi aplikasi.

#### `src/server.ts`

Bertanggung jawab menjalankan server:

```text
server.ts
    ↓
app.ts
    ↓
Express Application
    ↓
HTTP Server
```

---

## 13. Database

Database menggunakan **PostgreSQL** melalui Prisma ORM.

Entitas utama:

```text
User
├── PatientProfile
│   ├── TherapyPrescription
│   │   └── TherapySession
│   ├── MedicationSchedule
│   │   └── MedicationLog
│   ├── NakesNote
│   └── ChatSummary
│
└── NakesProfile
    └── NakesNote
```

### 13.1 User

Menyimpan data autentikasi dan role pengguna.

Data utama:

- `id`
- `email`
- `password`
- `role`
- `createdAt`
- `updatedAt`

Role:

```text
PATIENT
NAKES
```

### 13.2 PatientProfile

Menyimpan data profil pasien dan hubungan dengan Nakes.

Relasi:

- User
- Nakes
- TherapyPrescription
- TherapySession
- MedicationSchedule
- NakesNote
- ChatSummary

### 13.3 NakesProfile

Menyimpan profil Nakes dan daftar pasien yang ditangani.

### 13.4 TherapyPrescription

Menyimpan instruksi terapi dari Nakes.

Data meliputi:

- Jenis gerakan.
- Target sudut.
- Target repetisi.
- Frekuensi per hari.
- Tanggal mulai.
- Tanggal berakhir.

### 13.5 TherapySession

Menyimpan hasil pelaksanaan terapi pasien.

Data meliputi:

- Resep terapi.
- Pasien.
- Estimasi sudut yang dicapai.
- Repetisi valid.
- Durasi.
- Waktu pelaksanaan.

### 13.6 MedicationSchedule

Menyimpan jadwal obat pasien.

### 13.7 MedicationLog

Menyimpan riwayat pasien mencatat konsumsi obat.

### 13.8 NakesNote

Menyimpan catatan yang dibuat Nakes untuk pasien.

### 13.9 ChatSummary

Menyimpan:

- Ringkasan percakapan.
- Ringkasan AI.
- Respons Nakes.

Data percakapan pasien harus diperlakukan sebagai data sensitif.

---

## 14. Security Requirements

Sistem harus memenuhi aturan berikut.

### 14.1 Authentication

- Password wajib di-hash.
- JWT digunakan untuk autentikasi.
- JWT secret berasal dari environment variable.

### 14.2 Authorization

Setiap endpoint privat harus melakukan:

```text
JWT Authentication
       ↓
Role Authorization
       ↓
Resource Ownership Check
       ↓
Controller
```

### 14.3 Secrets

Secret tidak boleh di-hardcode.

Contoh:

```env
DATABASE_URL=
JWT_SECRET=
GEMINI_API_KEY=
PORT=
```

File `.env` tidak boleh di-commit.

### 14.4 Sensitive Data

Data kesehatan pasien tidak boleh dicetak secara penuh ke server log.

---

## 15. AI Safety Requirements

AI chatbot menggunakan Gemini API.

AI harus memiliki system prompt yang secara eksplisit membatasi kemampuannya.

### AI diperbolehkan

- Mengajukan pertanyaan untuk memahami keluhan.
- Mengidentifikasi informasi penting dari percakapan.
- Menyusun ringkasan.
- Menyusun informasi agar mudah dipahami Nakes.

### AI dilarang

- Memberikan diagnosis.
- Menentukan penyakit.
- Merekomendasikan obat.
- Meresepkan obat.
- Menentukan terapi.
- Mengubah program terapi.
- Menggantikan keputusan Nakes.

Output AI harus diperlakukan sebagai **informasi pendukung**, bukan keputusan medis.

---

## 16. Gyroscope Requirements

Data gyroscope digunakan untuk membantu monitoring gerakan.

Sistem dapat menghitung:

- Estimasi sudut.
- Repetisi.
- Durasi.
- Validitas gerakan berdasarkan rule yang ditentukan aplikasi.

Namun:

> **Hasil gyroscope merupakan estimasi dan bukan pengukuran medis resmi.**

Target terapi berasal dari Nakes.

Pasien tidak dapat mengubah target sudut atau target repetisi secara mandiri.

---

## 17. Validation Requirements

Semua input dari client harus divalidasi menggunakan Zod.

Validasi diterapkan pada:

- Request body.
- URL parameters.
- Query parameters.

Flow:

```text
HTTP Request
     ↓
Authentication
     ↓
Authorization
     ↓
Zod Validation
     ↓
Controller
     ↓
Service
     ↓
Prisma
```

---

## 18. Error Handling

Backend menggunakan centralized error handling.

Error dari controller/service tidak boleh menyebabkan server crash.

Error response harus menggunakan format API yang konsisten.

Contoh:

```json
{
  "success": false,
  "message": "Pasien tidak ditemukan",
  "error": {
    "code": "PATIENT_NOT_FOUND"
  }
}
```

Error internal tidak boleh mengekspos:

- Database credentials.
- JWT secret.
- Gemini API key.
- Stack trace.
- Data kesehatan pasien.

---

## 19. Testing Requirements

Backend minimal memiliki testing untuk fitur kritis.

### 19.1 Authentication

- Register berhasil.
- Login berhasil.
- Password salah.
- JWT tidak valid.

### 19.2 Authorization

- PATIENT tidak dapat mengakses endpoint NAKES.
- PATIENT tidak dapat mengakses pasien lain.
- NAKES tidak dapat mengakses pasien yang bukan tanggung jawabnya.

### 19.3 Therapy

- Membuat resep terapi.
- Membuat sesi terapi.
- Mengambil riwayat terapi.
- Validasi input terapi.

### 19.4 Medication

- Membuat jadwal obat.
- Membuat medication log.
- Validasi ownership pasien.

### 19.5 AI

- Chat dapat diproses.
- Ringkasan dapat dibuat.
- Guardrail AI tetap aktif.

---

## 20. Environment Variables

Environment variable yang digunakan:

```env
DATABASE_URL=
JWT_SECRET=
GEMINI_API_KEY=
PORT=
```

Tidak ada secret yang boleh ditulis langsung di source code.

---

## 21. Out of Scope

Fitur berikut tidak termasuk dalam MVP:

- Integrasi SATUSEHAT.
- Integrasi langsung dengan rumah sakit/puskesmas.
- Modul skrining penyakit lain.
- Caregiver/keluarga.
- Diagnosis menggunakan AI.
- Resep otomatis menggunakan AI.
- Push notification real-time.
- Integrasi wearable device.
- Integrasi goniometer medis.
- Video call dengan Nakes.
- Pembayaran atau sistem billing.

---

## 22. MVP Scope

Untuk menjaga project tetap realistis, MVP Connect difokuskan pada:

### Authentication

- Register.
- Login.
- JWT.
- RBAC.

### Patient

- Melihat terapi.
- Melakukan sesi terapi.
- Menyimpan hasil terapi.
- Melihat riwayat terapi.
- Melihat jadwal obat.
- Mencatat konsumsi obat.
- Chat dengan AI.
- Melihat respons/catatan Nakes.

### Nakes

- Melihat pasien.
- Membuat resep terapi.
- Membuat jadwal obat.
- Melihat riwayat terapi.
- Melihat kepatuhan.
- Membuat catatan.
- Melihat ringkasan AI.
- Memberikan respons.

---

## 23. Metrik Keberhasilan

MVP dapat dievaluasi menggunakan:

1. Jumlah sesi terapi yang berhasil direkam.
2. Tingkat kepatuhan terapi pasien.
3. Tingkat kepatuhan obat.
4. Jumlah keluhan yang berhasil dirangkum AI.
5. Waktu respons Nakes terhadap keluhan pasien.
6. Persentase endpoint kritis yang memiliki automated test.
7. Jumlah error authorization yang berhasil dicegah.

---

## 24. Development Guidelines

Development Connect harus mengikuti prinsip berikut:

1. Gunakan TypeScript Strict Mode.
2. Hindari `any`.
3. Gunakan Zod untuk validasi input.
4. Jangan melakukan query Prisma langsung dari controller.
5. Jangan menaruh business logic di routes.
6. Gunakan service sebagai tempat business logic.
7. Semua endpoint privat harus menggunakan JWT.
8. Terapkan RBAC dan ownership check.
9. Jangan mengekspos data kesehatan pada log.
10. Jangan hardcode secret.
11. Jangan melemahkan AI guardrail.
12. Jangan menganggap gyroscope sebagai alat medis.
13. Jangan menambahkan dependency tanpa persetujuan.
14. Jangan menghapus migration lama.
15. Jangan melakukan perubahan database yang berisiko tanpa memahami dampaknya.

---

## 25. Struktur Repository

Struktur repository yang digunakan saat ini:

```text
Joints-backend/
│
├── .agents/
├── .claude/
├── .cursor/
├── .devin/
├── .vscode/
│
├── dist/
├── node_modules/
│
├── prisma/
│
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── prisma/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── app.ts
│   └── server.ts
│
├── .env
├── .gitignore
├── AGENTS.md
├── package-lock.json
├── package.json
├── PRD.md
└── tsconfig.json
```

> `node_modules/`, `dist/`, dan `.env` merupakan bagian dari environment/development setup dan bukan source code utama yang harus dipahami AI Agent sebagai bagian dari arsitektur aplikasi.

---

## 26. Status Pengembangan

**Status:** Active Development

Prioritas pengembangan:

```text
1. Project Setup
      ↓
2. Prisma & Database
      ↓
3. Authentication
      ↓
4. RBAC
      ↓
5. Patient Management
      ↓
6. Therapy Prescription
      ↓
7. Therapy Session
      ↓
8. Medication
      ↓
9. Nakes Notes
      ↓
10. AI Chatbot
      ↓
11. Dashboard & Analytics
      ↓
12. Testing & Security Hardening
```

---

## 27. Dokumentasi API

Setelah endpoint backend mulai stabil, dokumentasi API sebaiknya dibuat secara terpisah dari PRD.

PRD menjelaskan:

> **Apa yang harus dibuat?**

`AGENTS.md` menjelaskan:

> **Bagaimana AI Agent harus mengerjakannya?**

Dokumentasi API menjelaskan:

> **Bagaimana client menggunakan backend?**

Dokumentasi API dapat dibuat menggunakan OpenAPI/Swagger setelah struktur endpoint utama stabil.
