# AGENTS.md

Dokumen ini adalah panduan untuk AI coding agent (misalnya Claude Code, Cursor, Devin, Agentic Tools) yang bekerja pada repository **Connect** (atau `Joints-backend`).

> **Penting:** Baca dokumen ini sebelum membuat, mengubah, atau menghapus kode apa pun.

---

## 1. Ringkasan Proyek

**Connect** adalah backend aplikasi yang menjembatani pasien fisioterapi mandiri di rumah dengan tenaga kesehatan (Nakes).

Fitur utama meliputi:

* Autentikasi dengan dua role: `PATIENT` dan `NAKES`
* Pendeteksi gerakan berbasis data gyroscope
* Jadwal obat dan terapi
* Riwayat terapi
* Catatan Nakes
* AI chatbot sebagai penjembatan keluhan pasien kepada Nakes

Rujukan lengkap mengenai kebutuhan produk tersedia di `PRD.md` pada root repository. **Baca file tersebut terlebih dahulu** untuk memahami konteks domain dan bisnis sebelum mengerjakan fitur apa pun.

---

## 2. Tech Stack Core

| Layer          | Teknologi                                                            |
| -------------- | -------------------------------------------------------------------- |
| Runtime        | Node.js (v18+)                                                       |
| Language       | TypeScript                                                           |
| Framework      | Express.js                                                           |
| ORM            | Prisma ORM                                                           |
| Database       | PostgreSQL                                                           |
| Validation     | Zod                                                                  |
| Auth           | JWT (`jsonwebtoken`) & Password Hashing (`bcrypt` / `argon2`)        |
| AI Integration | Google Generative AI SDK (`@google/genai` / `@google/generative-ai`) |
| Testing        | Jest / Vitest + Supertest                                            |

> **⚠️ Aturan ketat:** Jangan mengganti, menambah, atau mengurangi pustaka inti di atas tanpa izin eksplisit dari pengguna, meskipun AI menganggap terdapat alternatif yang lebih baik.

---

## 3. Struktur Folder Repository

Repository menggunakan struktur modular layered yang presisi. AI wajib menempatkan kode baru sesuai dengan lokasi yang telah ditentukan berikut:

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

### Aturan Penempatan Kode

#### `src/routes/`

Tempat mendaftarkan endpoint HTTP.

* Router memanggil middleware validation/auth.
* Router mengarahkan request ke controller.
* **Jangan menempatkan logika bisnis di sini.**

#### `src/controllers/`

Menangani `req: Request` dan `res: Response`.

Controller bertugas untuk:

1. Mengambil input dari request.
2. Memanggil service yang sesuai.
3. Mengembalikan HTTP response.

> **Jangan melakukan query Prisma secara langsung di controller.**

#### `src/services/`

Tempat **seluruh logika bisnis**, termasuk:

* Pemrosesan data gyroscope.
* Integrasi dengan Gemini AI.
* Query database melalui Prisma Client (`src/prisma/`).
* Kalkulasi dan pemrosesan data lainnya.

#### `src/middleware/`

Tempat middleware untuk:

* Pengecekan JWT token.
* Validasi menggunakan Zod.
* Penanganan error global.
* RBAC (Role-Based Access Control).

#### `src/prisma/`

Tempat instance Prisma Client yang di-export agar dapat digunakan kembali dan mencegah koneksi database ganda (*connection leak*).

#### `src/utils/`

Berisi fungsi pembantu serbaguna, seperti:

* JWT sign/verify helper.
* Password hashing.
* Custom API response formatter.
* Helper umum lainnya.

---

## 4. Perintah yang Sering Dipakai

### Development Server

Menjalankan server dalam mode development:

```bash
npm run dev
```

### Prisma Generate

Memformat schema dan menghasilkan Prisma Client:

```bash
npx prisma generate
```

### Prisma Migration

Menjalankan migrasi database pada environment lokal:

```bash
npx prisma migrate dev --name <deskripsi_migrasi>
```

### Prisma Studio

Membuka Prisma Studio sebagai database GUI:

```bash
npx prisma studio
```

### Build

Melakukan build TypeScript ke JavaScript (`/dist`):

```bash
npm run build
```

### Test

Menjalankan seluruh test:

```bash
npm test
```

> **Penting:** Setelah mengubah `prisma/schema.prisma`, AI wajib menjalankan `npx prisma generate` dan/atau `npx prisma migrate dev` sesuai kebutuhan agar Prisma Client dan TypeScript types tetap sinkron dengan database.

---

## 5. Konvensi Kode & Standar TypeScript

### TypeScript

* Gunakan **Strict Mode** TypeScript.
* Hindari penggunaan tipe `any`.
* Selalu definisikan `interface` atau `type` dengan jelas.

### Penamaan File

Gunakan `camelCase` atau `kebab-case` secara konsisten sesuai pola yang sudah digunakan di repository.

Contoh:

```text
authController.ts
```

atau:

```text
auth.controller.ts
```

### Validasi Input

Gunakan **Zod** untuk melakukan validasi terhadap:

* `req.body`
* `req.params`
* `req.query`

Validasi harus dilakukan sebelum data diteruskan ke controller atau service.

### Error Handling

Semua controller async wajib:

* Dibungkus dengan `try-catch`, atau
* Menggunakan `asyncHandler` middleware.

Tujuannya adalah mencegah *unhandled promise rejection*.

### API Response

Semua response API harus menggunakan struktur response yang konsisten melalui utility formatter.

Contoh:

```json
{
  "success": true,
  "data": {},
  "message": "Request berhasil diproses"
}
```

---

## 6. Hak Akses & Keamanan Role (`PATIENT` vs `NAKES`)

Terdapat dua role utama:

* `PATIENT`
* `NAKES`

### Aturan Endpoint

Semua endpoint privat wajib menggunakan:

1. Middleware autentikasi JWT.
2. Pengecekan role yang sesuai jika endpoint memiliki batasan role.

### Aturan Akses Data

**Dilarang keras** bagi pasien untuk:

* Membaca data milik pasien lain.
* Mengubah data milik pasien lain.
* Menulis atau mengubah catatan Nakes.
* Membuat atau mengubah resep terapi maupun obat yang hanya boleh dikelola oleh Nakes.

Setiap akses terhadap data pasien harus memastikan bahwa pengguna memiliki hak akses terhadap data tersebut.

---

## 7. Batasan Domain Kesehatan & AI

> **⚠️ Bagian ini sangat penting dan tidak boleh dilemahkan.**

### AI Chatbot Tidak Boleh Memberikan Diagnosis Medis

System prompt Gemini API yang digunakan pada `src/services/` wajib membatasi AI hanya untuk:

* Menggali informasi mengenai keluhan pasien.
* Membantu pasien menyampaikan keluhan secara lebih terstruktur.
* Membuat ringkasan terstruktur untuk Nakes.

AI **dilarang**:

* Menyimpulkan diagnosis penyakit.
* Memberikan diagnosis medis.
* Meresepkan obat.
* Mengubah atau menentukan terapi medis.

**Jangan pernah melemahkan system prompt atau guardrail ini.**

### Data Gyroscope Adalah Estimasi

Data sudut atau pergerakan yang diperoleh dari gyroscope merupakan **estimasi pergerakan**, bukan pengukuran medis resmi menggunakan goniometer.

Response API dan komentar kode yang berkaitan dengan data tersebut wajib menggunakan konteks ini.

Hindari memberikan kesan bahwa hasil gyroscope merupakan:

* Diagnosis medis.
* Pengukuran klinis resmi.
* Pengganti pemeriksaan tenaga kesehatan.

### Kontrol Resep Hanya untuk Nakes

Data berikut hanya boleh dibuat atau diubah oleh role `NAKES`:

* Resep gerakan terapi.
* Durasi terapi.
* Target sudut gerakan.
* Dosis obat.
* Instruksi terapi lainnya yang bersifat medis.

---

## 8. Penanganan Data Sensitif & Secret

### Environment Variables

Jangan pernah menuliskan secret secara langsung (*hardcoded*) di dalam source code.

Secret seperti berikut wajib dibaca melalui `process.env`:

* Gemini API Key.
* Database URL.
* JWT Secret.
* Credential atau secret lainnya.

Contoh:

```typescript
const jwtSecret = process.env.JWT_SECRET;
```

### File `.env`

File `.env` **tidak boleh di-commit** ke repository.

Pastikan `.env` tercantum dalam `.gitignore`.

### Password

Password wajib di-hash menggunakan `bcrypt` atau `argon2` sebelum disimpan ke database melalui Prisma.

Password **tidak boleh disimpan dalam bentuk plaintext**.

### Data Kesehatan

Data berikut merupakan data sensitif dan harus diperlakukan sebagai data rahasia:

* Riwayat terapi pasien.
* Percakapan AI.
* Catatan medis.
* Data keluhan pasien.
* Data kesehatan lainnya.

**Dilarang mencetak payload data kesehatan secara penuh menggunakan `console.log` atau server log lainnya.**

Jika logging diperlukan untuk debugging, hanya log informasi minimum yang tidak mengekspos data kesehatan sensitif.

---

## 9. Hal yang Tidak Boleh Dilakukan AI Agent Tanpa Konfirmasi Pengguna

AI Agent **wajib meminta konfirmasi pengguna terlebih dahulu** sebelum melakukan hal-hal berikut:

### 1. Mengubah Prisma Schema

Jangan mengubah struktur `prisma/schema.prisma` jika perubahan tersebut berdampak pada tabel atau relasi lain tanpa menjelaskan terlebih dahulu:

* Perubahan schema yang akan dilakukan.
* Dampak terhadap tabel atau relasi yang sudah ada.
* Potensi breaking changes.
* Dampak terhadap migration.

### 2. Menginstall Dependency Baru

Jangan menginstall library atau dependency npm baru di luar dependency yang telah disepakati tanpa izin eksplisit pengguna.

### 3. Menghapus Migration Lama

Jangan menghapus file migration lama dari:

```text
prisma/migrations/
```

Migration yang sudah ada harus dianggap sebagai bagian dari histori database dan tidak boleh dihapus sembarangan.

### 4. Melemahkan AI Guardrail

Jangan mengurangi, menghapus, atau melemahkan instruksi/system prompt guardrail AI pada fitur chatbot.

### 5. Push ke Main atau Production

Jangan melakukan push secara langsung ke:

* Branch `main`
* Environment production

tanpa konfirmasi eksplisit dari pengguna.

---

## 10. Prinsip Umum untuk AI Agent

Saat mengerjakan repository ini, AI Agent harus mengikuti prinsip berikut:

1. **Baca `AGENTS.md` dan `PRD.md` terlebih dahulu.**
2. Pahami struktur arsitektur sebelum membuat file baru.
3. Ikuti separation of concerns antara route, controller, service, middleware, dan utility.
4. Jangan menambahkan dependency tanpa izin.
5. Prioritaskan keamanan data pasien.
6. Jangan menganggap data gyroscope sebagai data medis resmi.
7. Jangan memberikan diagnosis atau resep melalui AI chatbot.
8. Pastikan setiap endpoint memiliki validasi input yang sesuai.
9. Pastikan endpoint privat memiliki autentikasi dan authorization yang benar.
10. Jangan melakukan perubahan database yang berisiko tanpa menjelaskan dampaknya terlebih dahulu.
11. Jangan melakukan operasi Git yang bersifat irreversible atau berdampak ke production tanpa konfirmasi.
12. Jika terdapat konflik antara implementasi dan aturan dalam dokumen ini, **ikuti aturan dalam `AGENTS.md` dan tanyakan kepada pengguna jika diperlukan.**

---

## 11. Pemeliharaan Dokumen

Dokumen ini bersifat **dinamis**.

Jika terdapat perubahan arsitektur, konvensi kode, teknologi, aturan keamanan, atau keputusan teknis yang telah disepakati oleh tim, `AGENTS.md` harus diperbarui agar tetap menjadi sumber kebenaran (*source of truth*) bagi AI Agent yang bekerja pada repository.
