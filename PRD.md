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

Connect menyediakan fitur pelaporan keluhan agar pasien dapat menyampaikan kondisi yang dialami kepada Nakes yang menanganinya. Nakes dapat membaca laporan tersebut dan memberikan respons atau tindak lanjut melalui aplikasi.

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
6. Memudahkan Nakes membaca, meninjau, dan menindaklanjuti keluhan yang disampaikan pasien.

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
| P6 | Pelaporan Keluhan | Pasien dapat mengirimkan laporan keluhan kepada Nakes yang menangani dan melihat status serta respons atas laporan tersebut. |

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

### 5.6 Pelaporan Keluhan

Pasien dapat mengirimkan laporan keluhan secara langsung kepada Nakes yang menangani.

Informasi laporan dapat mencakup:

- Judul atau topik keluhan.
- Deskripsi keluhan yang ditulis pasien.
- Lokasi keluhan, jika relevan.
- Skala nyeri 0–10, jika relevan.
- Waktu mulai keluhan, jika diketahui.
- Waktu laporan dibuat.
- Status penanganan laporan.

#### Alur Pelaporan

1. Pasien mengisi dan mengirim laporan keluhan.
2. Backend memvalidasi dan menyimpan laporan yang terkait dengan pasien tersebut.
3. Laporan muncul pada daftar keluhan di dashboard Nakes yang menangani pasien.
4. Nakes membaca detail laporan dan memberikan respons atau arahan sesuai kewenangannya.
5. Pasien dapat membaca respons Nakes dan melihat status laporan.

#### Status Laporan

- `PENDING`: laporan menunggu ditinjau Nakes.
- `IN_PROGRESS`: laporan sedang ditindaklanjuti Nakes.
- `RESOLVED`: Nakes menandai laporan telah ditangani atau ditutup.

#### Batasan Fitur

- Fitur ini merupakan sarana komunikasi tindak lanjut, bukan layanan darurat.
- Sistem tidak memberikan diagnosis atau rekomendasi medis otomatis.
- Arahan klinis diberikan oleh Nakes sesuai kewenangannya.
- Pasien harus diberi tahu bahwa laporan tidak selalu dibaca atau dibalas secara langsung. Untuk kondisi darurat atau kondisi yang memburuk, pasien harus mencari pertolongan medis segera.
- Untuk MVP, fitur ini menggunakan laporan dan respons Nakes, bukan percakapan chat real-time.

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
| N7 | Daftar dan Detail Keluhan | Melihat laporan keluhan dari pasien yang berada di bawah tanggung jawabnya. |
| N8 | Tindak Lanjut Keluhan | Memberikan respons atau arahan dan memperbarui status penanganan laporan. |

### 6.1 Dashboard Monitoring

Dashboard Nakes menampilkan informasi pasien yang ditangani, seperti:

- Jumlah pasien.
- Kepatuhan terapi.
- Kepatuhan obat.
- Riwayat sesi terapi.
- Tren hasil terapi.
- Keluhan pasien yang belum ditinjau atau masih dalam proses penanganan.

### 6.2 Manajemen Pasien

Nakes dapat:

- Melihat pasien yang ditangani.
- Melihat profil pasien.
- Melihat riwayat terapi.
- Melihat kepatuhan pasien.
- Melihat catatan pasien.
- Melihat laporan keluhan yang dikirim pasien.

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
Mengisi Laporan Keluhan
  ↓
Backend Memvalidasi dan Menyimpan Laporan
  ↓
Dashboard Nakes
  ↓
Nakes Membaca Laporan
  ↓
Nakes Memberikan Respons / Arahan
  ↓
Pasien Membaca Respons dan Status Laporan
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
- Laporan keluhan pasien
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
├── /connections
│   ├── GET  /status     # PATIENT: melihat status koneksi
│   ├── POST /code       # PATIENT: membuat kode 6 digit, berlaku 10 menit
│   └── POST /redeem     # NAKES: menautkan pasien dengan kode
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
├── /consultations
│   ├── POST /                 # PATIENT: membuat laporan keluhan
│   ├── GET  /                 # daftar laporan sesuai role
│   ├── GET  /:consultationId  # detail laporan
│   ├── POST /:consultationId/responses  # NAKES: memberi respons
│   └── PATCH /:consultationId/status   # NAKES: memperbarui status
```

Endpoint final dapat berkembang mengikuti implementasi backend.

### Membuat Sesi Terapi

`POST /api/therapy-sessions` membutuhkan JWT dengan role `PATIENT`. Identitas pasien
diambil dari JWT; client tidak mengirim `patientId`. Jika `prescriptionId` disertakan,
resep harus dimiliki pasien tersebut.

```json
{
  "programName": "Latihan Lutut",
  "therapyType": "GYROSCOPE",
  "estimatedAngle": 32.5,
  "validRepetitions": 3,
  "durationMs": 120000,
  "sampleCount": 1200,
  "performedAt": "2026-10-10T08:00:00.000Z"
}
```

`therapyType` wajib bernilai `GYROSCOPE` atau `CAMERA` dan secara default bernilai
`GYROSCOPE` untuk kompatibilitas dengan client lama. Pada mode `GYROSCOPE`, sudut
dan repetisi merupakan estimasi generik dari data gyroscope, bukan pengukuran medis.
Implementasi saat ini mengintegrasikan laju rotasi (rad/s), memilih sumbu dengan
rentang gerak terbesar, dan menghitung satu repetisi ketika sudut melewati 30° lalu
kembali ke dalam 10° dari posisi awal. Jeda sampel di atas 500 ms tidak
diintegrasikan. Ambang ini bukan target medis dan perlu dikalibrasi terhadap gerakan
serta resep yang sebenarnya. Mode `CAMERA` menyimpan hasil sesi latihan berbasis
kamera; hasil tersebut tetap merupakan estimasi dan bukan pengukuran klinis resmi.
`prescriptionId` bersifat opsional jika sesi tidak dijalankan dari resep yang telah
dimuat oleh aplikasi. Jika resep disertakan, nilainya harus berupa UUID resep milik
pasien.

### Prinsip API

- Semua endpoint menerima dan mengembalikan JSON.
- Endpoint privat membutuhkan JWT.
- Input divalidasi menggunakan Zod.
- Authorization harus dilakukan sebelum mengakses data pasien.
- Controller tidak boleh melakukan query Prisma secara langsung.

### Media Gerakan Terapi

`POST /api/therapy/movements` hanya dapat digunakan oleh Nakes dan mewajibkan
gambar serta video YouTube untuk setiap gerakan. Client mengirimkan `imageBase64`
berisi data gambar base64 tanpa data-URI prefix, `imageMimeType` bernilai
`image/jpeg`, `image/png`, atau `image/webp`, dan `youtubeUrl` berupa tautan video
YouTube HTTPS. Ukuran gambar maksimum 5 MB dan byte gambar disimpan di PostgreSQL.
Response gerakan menyertakan `imageBase64`, `imageMimeType`, dan `youtubeUrl` agar
aplikasi pasien dapat menampilkan kedua media tersebut. Data media lama tetap
dipertahankan untuk kompatibilitas, tetapi tidak dapat digunakan untuk membuat
gerakan baru.

Nakes dapat memperbarui sebagian field gerakan melalui
`PATCH /api/therapy/movements/:movementId`. Jika gambar diperbarui,
`imageBase64` dan `imageMimeType` wajib dikirim bersama. Gerakan yang sudah
digunakan oleh resep tidak dapat dihapus (`DELETE /api/therapy/movements/:movementId`)
dan akan menghasilkan respons konflik.

Resep terapi dapat diperbarui melalui `PATCH /api/therapy/prescriptions/:prescriptionId`
atau dihapus melalui `DELETE /api/therapy/prescriptions/:prescriptionId`.
Kedua operasi hanya dapat dilakukan Nakes yang menangani pasien terkait.
Penghapusan resep melepaskan referensi resep pada sesi terapi yang telah tercatat,
tanpa menghapus riwayat sesi tersebut.

### Menghubungkan Pasien dengan Nakes

Pasien yang belum terhubung meminta kode melalui `POST /api/connections/code`.
Kode 6 digit berlaku selama 10 menit. Nakes memasukkan kode dan data awal pasien
melalui `POST /api/connections/redeem` dengan body `{"code":"123456"}`. Kode hanya
digunakan untuk menautkan pasien; setelah berhasil, Nakes mengisi data klinis
melalui `PATCH /api/connections/patients/:patientId/clinical`. Data yang dapat
disimpan meliputi kondisi medis, riwayat penyakit, alergi, lokasi keluhan,
tanggal mulai keluhan, skala nyeri (0–10), dan catatan awal. Contoh:

```json
{
  "kondisiMedis": "ACL",
  "riwayatPenyakit": "Maag",
  "alergi": "Tidak diketahui",
  "lokasiKeluhan": "Lutut",
  "tanggalMulaiKeluhan": "2026-10-01",
  "skalaNyeri": 4,
  "catatanAwal": "Keluhan nyeri saat menekuk lutut."
}
```

Request pembaruan menerima sebagian atau seluruh field tersebut; field yang
dikirim sebagai string kosong atau `null` akan dikosongkan, sedangkan field yang
tidak dikirim tidak berubah. Endpoint hanya dapat digunakan Nakes yang menangani
pasien tersebut. Kode hanya dapat digunakan sekali. Data klinis disimpan sebagai
bagian profil pasien. Aplikasi pasien dapat mengecek status melalui
`GET /api/connections/status`; setelah berhasil ditautkan, pasien muncul pada daftar
`GET /api/therapy/patients` milik Nakes tersebut. Kode yang sudah kedaluwarsa
atau digunakan tidak dapat dipakai kembali.

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
- Membuat laporan keluhan untuk dirinya sendiri.
- Membaca laporan keluhan dan respons Nakes miliknya sendiri.
- Melihat status penanganan laporannya.

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
- Membaca laporan keluhan pasien yang ditangani.
- Memberikan respons atau arahan pada laporan tersebut.
- Memperbarui status penanganan laporan.

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
│   └── Consultation
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
- Consultation

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

### 13.9 Consultation

Menyimpan laporan keluhan dan tindak lanjut Nakes.

Data utama:

- `id`
- `patientId`
- `nakesId`
- `subject`
- `description`
- `location` (opsional)
- `painScale` (opsional, 0–10)
- `symptomStartedAt` (opsional)
- `status` (`PENDING`, `IN_PROGRESS`, `RESOLVED`)
- `response` (opsional, respons Nakes)
- `createdAt`
- `updatedAt`
- `resolvedAt` (opsional)

Data keluhan dan respons merupakan data kesehatan sensitif dan harus dilindungi dengan pemeriksaan otorisasi serta kepemilikan data.

Untuk MVP, satu laporan menyimpan satu respons/tindak lanjut utama dari Nakes. Sistem belum memerlukan riwayat chat dua arah atau ringkasan AI.

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
PORT=
```

File `.env` tidak boleh di-commit.

### 14.4 Sensitive Data

Data kesehatan pasien tidak boleh dicetak secara penuh ke server log.

---

## 15. Batasan dan Keamanan Pelaporan Keluhan

Fitur pelaporan keluhan pada MVP tidak menggunakan AI.

- Laporan berasal langsung dari pasien dan tidak boleh diubah maknanya oleh sistem.
- Sistem tidak memberikan diagnosis, rekomendasi obat, atau keputusan terapi otomatis.
- Respons klinis diberikan oleh Nakes sesuai kewenangannya.
- Data keluhan dan respons diperlakukan sebagai data kesehatan sensitif.
- Pasien harus diberi tahu bahwa fitur ini bukan layanan darurat dan respons Nakes tidak dijamin real-time.

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

- Pasien dapat membuat laporan keluhan.
- Nakes yang menangani dapat membaca laporan.
- Nakes dapat memberikan respons dan memperbarui status.
- Pasien hanya dapat membaca laporan dan respons miliknya sendiri.
- Pengguna yang tidak memiliki hubungan penanganan tidak dapat mengakses laporan.

---

## 20. Environment Variables

Environment variable yang digunakan:

```env
DATABASE_URL=
JWT_SECRET=
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
- Mengirim laporan keluhan.
- Melihat status dan respons Nakes.

### Nakes

- Melihat pasien.
- Membuat resep terapi.
- Membuat jadwal obat.
- Melihat riwayat terapi.
- Melihat kepatuhan.
- Membuat catatan.
- Melihat laporan keluhan pasien.
- Memberikan respons dan memperbarui status penanganan.

---

## 23. Metrik Keberhasilan

MVP dapat dievaluasi menggunakan:

1. Jumlah sesi terapi yang berhasil direkam.
2. Tingkat kepatuhan terapi pasien.
3. Tingkat kepatuhan obat.
4. Jumlah laporan keluhan yang berhasil ditinjau dan ditindaklanjuti.
5. Waktu respons Nakes terhadap laporan keluhan.
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
11. Fitur pelaporan keluhan MVP tidak bergantung pada AI.
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
10. Pelaporan Keluhan dan Tindak Lanjut Nakes
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
