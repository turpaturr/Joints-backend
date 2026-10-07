# AGENTS.md

Dokumen ini adalah panduan untuk AI coding agent (misalnya Claude Code, Cursor, Devin, Agentic Tools) yang bekerja pada repository **Connect** (atau `Joints-backend`). Baca dokumen ini sebelum membuat, mengubah, atau menghapus kode apa pun.

---

## 1. Ringkasan Proyek

Connect adalah backend aplikasi yang menjembatani pasien fisioterapi mandiri di rumah dengan tenaga kesehatan (nakes). Fitur utamanya mencakup autentikasi dua role (`PATIENT` & `NAKES`), pendeteksi gerakan berbasis data gyroscope, jadwal obat/terapi, riwayat terapi, catatan nakes, dan AI chatbot penjembatan keluhan pasien ke nakes.

Rujukan lengkap kebutuhan produk ada di `PRD.md` di root repo — baca file tersebut terlebih dahulu untuk memahami konteks domain & bisnis.

---

## 2. Tech Stack Core

| Layer | Teknologi |
|---|---|
| Runtime | Node.js (v18+) |
| Language | TypeScript |
| Framework | Express.js |
| ORM | Prisma ORM |
| Database | PostgreSQL |
| Validation | Zod |
| Auth | JWT (`jsonwebtoken`) & Password Hashing (`bcrypt` / `argon2`) |
| AI Integration | Google Generative AI SDK (`@google/genai` / `@google/generative-ai`) |
| Testing | Jest / Vitest + Supertest |

⚠️ **Aturan Ketat:** Jangan mengganti, menambah, atau mengurangi pustaka inti di atas tanpa izin eksplisit dari pengguna, meskipun AI menganggap ada alternatif lain yang "lebih baik".

---

## 3. Struktur Folder Repository

Repository ini menggunakan struktur modular layered yang presisi. AI wajib menempatkan kode baru sesuai dengan lokasi yang sudah ditentukan di bawah ini:

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


### Aturan Penempatan Kode:
- **Routes (`src/routes/`)**: Tempat mendaftarkan endpoint HTTP. Router memanggil middleware validation/auth lalu mengarah ke controller. Jangan buat logika bisnis di sini.
- **Controllers (`src/controllers/`)**: Menangani `req: Request` dan `res: Response`. Mengambil input, memanggil service yang sesuai, lalu memberikan response HTTP. Jangan langsung melakukan query Prisma di controller.
- **Services (`src/services/`)**: Tempat SELURUH logika bisnis, pemrosesan data gyroscope, panggilan ke Gemini AI, dan query database melalui Prisma Client (`src/prisma/`).
- **Middleware (`src/middleware/`)**: Tempat middleware pengecekan JWT token, validasi Zod schema, middleware penanganan error global, dan RBAC (Role-Based Access Control).
- **Prisma (`src/prisma/`)**: Tempat instance Prisma Client di-export agar reuseable dan tidak terjadi koneksi ganda (*connection leak*).
- **Utils (`src/utils/`)**: Fungsi pembantu serbaguna (seperti JWT sign/verify helper, hash password, custom API Response formatter).

---

## 4. Perintah yang Sering Dipakai

```bash
# Jalankan server development
npm run dev

# Format Prisma Schema / Generate Client
npx prisma generate

# Jalankan migrasi database di lokal
npx prisma migrate dev --name <deskripsi_migrasi>

# Buka Prisma Studio (Database GUI)
npx prisma studio

# Build TypeScript ke JavaScript (/dist)
npm run build

# Jalankan seluruh test
npm test

Setelah mengubah file prisma/schema.prisma, AI wajib mengeksekusi npx prisma generate dan/atau npx prisma migrate dev agar Prisma Client & TypeScript types tetap sinkron dengan database.
5. Konvensi Kode & Standar TypeScript

    Gunakan Strict Mode TypeScript. Hindari penggunaan tipe any! Selalu definisikan interface atau type dengan jelas.

    Penamaan file dan folder menggunakan camelCase atau kebab-case secara konsisten (contoh: authController.ts atau auth.controller.ts, sesuaikan dengan file yang sudah ada).

    Gunakan Zod untuk validasi req.body, req.params, dan req.query sebelum masuk ke controller/service.

    Semua controller async wajib dibungkus dengan try-catch atau dipasangkan dengan asyncHandler middleware agar tidak terjadi unhandled promise rejection.

    Tanggapan API (API Response) harus konsisten menggunakan struktur utilitas penyeragaman response (misal: { success: true, data: ..., message: ... }).

6. Hak Akses & Keamanan Role (PATIENT vs NAKES)

    Terdapat dua role utama: PATIENT dan NAKES.

    Semua endpoint privat wajib menggunakan middleware autentikasi JWT dan pengecekan role yang jelas.

    Dilarang keras: Pasien dapat membaca/mengubah data milik pasien lain, atau pasien menulis catatan/resep yang seharusnya hanya dimiliki oleh role Nakes.

7. Batasan Domain Kesehatan & AI (Sangat Penting)

    AI Chatbot Tidak Boleh Memberikan Diagnosis Medis Direct: System prompt Gemini API pada src/services/ wajib mengunci batasan AI hanya untuk menggali informasi keluhan pasien dan membuat ringkasan terstruktur untuk Nakes. AI dilarang menyimpulkan diagnosis penyakit atau meresepkan obat. Jangan pernah melemahkan prompt ini!

    Data Gyroscope Adalah Estimasi: Response API atau komentar kode seputar data sudut gyroscope wajib memperlakukan nilai tersebut sebagai estimasi pergerakan, bukan pengukuran medis resmi goniometer.

    Kontrol Resep Khusus Nakes: Resep gerakan terapi, durasi, target sudut, dan dosis obat hanya bisa dibuat atau diubah oleh Nakes.

8. Penanganan Data Sensitif & Secret

    Jangan pernah menyisipkan API Key (Gemini, Database URL, JWT Secret) langsung di dalam file kode (hardcoded). Wajib dibaca dari process.env.

    File .env tidak boleh di-commit.

    Password wajib di-hash menggunakan bcrypt / argon2 sebelum dimasukkan ke database via Prisma.

    Data rekam medis pasien (riwayat terapi, percakapan AI, catatan medis) bersifat rahasia. Dilarang mencetak (console.log) payload data kesehatan penuh ke dalam server log.

9. Hal yang Tidak Boleh Dilakukan AI Agent Tanpa Konfirmasi Pengguna

    Mengubah struktur prisma/schema.prisma yang berdampak pada tabel lain tanpa menjelaskan breaking changes-nya.

    Menginstall library/dependency npm baru di luar yang sudah disepakati.

    Menghapus file migrasi lama di folder prisma/migrations/.

    Melemahkan instruksi/system prompt guardrail AI pada fitur chatbot.

    Melakukan push langsung ke branch main atau production.

Dokumen ini bersifat dinamis. Perbarui jika ada perubahan konvensi arsitektur yang disepakati oleh tim.