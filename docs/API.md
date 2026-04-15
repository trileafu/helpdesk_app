# Dokumentasi API Helpdesk App

Dokumen ini merangkum antarmuka yang tersedia pada aplikasi helpdesk ini. Aplikasi memakai kombinasi HTTP route handler Next.js dan server actions, jadi dokumentasi dibagi menjadi dua bagian:

- API HTTP publik
- Server actions internal untuk halaman publik dan dashboard admin

## Ringkasan

Aplikasi ini menyediakan alur utama berikut:

- Pengunjung membuat tiket bantuan
- Pengunjung melacak tiket menggunakan kode tiket
- Admin masuk ke dashboard dan mengelola tiket, profil, serta pengguna admin

Base URL mengikuti nilai `NEXT_PUBLIC_APP_URL`. Jika belum disetel, beberapa email dan tautan fallback ke `http://localhost:3000`.

## Autentikasi

Autentikasi admin memakai session cookie bernama `session` yang disimpan sebagai `HttpOnly` cookie.

- Masa berlaku session: 5 menit
- Role yang dikenal: `admin` dan `superadmin`
- Endpoint publik tidak memerlukan autentikasi
- Aksi admin tertentu hanya bisa dipakai setelah login

## API HTTP Publik

### POST `/api/tickets/recent`

Mengambil detail tiket berdasarkan daftar kode tiket yang diberikan. Endpoint ini dipakai untuk menampilkan tiket-tiket yang baru dilacak pengguna berdasarkan cache lokal di browser.

#### Request Body

```json
{
	"codes": ["TIX-ABC123", "TIX-Z9K8P7"]
}
```

#### Aturan input

- `codes` harus berupa array
- Item yang bukan string akan diabaikan
- Kode duplikat akan dihapus
- Jika `codes` kosong atau tidak valid, server mengembalikan daftar kosong

#### Response Sukses

```json
{
	"tickets": [
		{
			"ticket_code": "TIX-ABC123",
			"title": "Printer tidak bisa dipakai",
			"status": "Open"
		}
	]
}
```

#### Response Gagal

```json
{
	"tickets": []
}
```

Jika terjadi error internal, status HTTP adalah `500`.

## Server Actions Publik

Bagian ini bukan endpoint REST klasik, tetapi fungsi server action yang dipakai oleh komponen Next.js.

### `createTicket(prevState, formData)`

Membuat tiket baru.

#### Field FormData

- `name` - nama pelanggan
- `email` - email pelanggan
- `title` - judul tiket
- `description` - deskripsi masalah
- `category` - ID kategori tiket
- `attachment` - file lampiran, opsional
- `g-recaptcha-response` - token CAPTCHA, opsional tergantung konfigurasi

#### Perilaku

- Memvalidasi field wajib
- Memverifikasi CAPTCHA jika `RECAPTCHA_SECRET_KEY` tersedia
- Mengunggah lampiran ke `public/uploads`
- Membuat ticket dengan status awal `Open`
- Mengirim email konfirmasi ke pelanggan
- Mengirim notifikasi email ke admin pertama yang ditemukan

#### Return Value

```ts
{ success: true, ticketCode: string }
```

atau

```ts
{
	error: string;
}
```

### `getCategories()`

Mengambil semua kategori tiket dari database.

#### Return Value

Array kategori dari tabel `Category`.

### `trackTicket(code)`

Mengambil detail tiket berdasarkan kode tiket.

#### Parameter

- `code`: kode tiket, misalnya `TIX-ABC123`

#### Data yang disertakan

- `category`
- `replies` beserta `user`
- `aiSuggestion`

### `replyClient(ticketId, message)`

Menambahkan balasan dari sisi pelanggan pada percakapan tiket.

#### Parameter

- `ticketId`: ID internal tiket
- `message`: isi balasan

#### Perilaku

- Mengabaikan pesan kosong
- Menyimpan reply dengan `sender_type = "client"`
- Melakukan revalidation halaman utama

### `getTicketReplies(ticketId)`

Mengambil seluruh balasan untuk tiket tertentu.

#### Return Value

Daftar reply tiket beserta data user admin jika ada.

### `getAllTickets()`

Mengambil semua tiket dengan relasi kategori, diurutkan dari yang terbaru.

### `getTicketFull(code)`

Mengambil data tiket lengkap berdasarkan kode tiket.

Data yang disertakan sama seperti `trackTicket`.

## Server Actions Admin

### `loginAdmin(prevState, formData)`

Login admin menggunakan email dan password.

#### Field FormData

- `email`
- `password`

#### Perilaku

- Memvalidasi kredensial ke tabel `User`
- Memeriksa password dengan bcrypt
- Membuat session cookie
- Melakukan redirect ke `/admin/dashboard`

### `logoutAdmin()`

Menghapus session admin dan redirect ke `/admin/login`.

### `updateTicket(ticketId, data)`

Memperbarui tiket dan mencatat perubahan status, prioritas, atau kategori sebagai system reply.

#### Parameter `data`

```ts
{
  status?: string;
  priority?: string;
  category_id?: number;
}
```

### `replyAdmin(ticketId, message)`

Menambahkan balasan dari admin ke tiket.

#### Perilaku

- Memerlukan session login
- Menyimpan reply dengan `sender_type = "admin"`
- Mengirim email notifikasi ke pelanggan terkait

### `updateAdminProfile(formData)`

Memperbarui profil admin yang sedang login.

#### Field FormData

- `name`
- `email`
- `avatar` - file gambar, opsional

#### Return Value

```ts
{ success: true, user: User }
```

### `changeAdminPassword(prevState, formData)`

Mengubah password admin yang sedang login.

#### Field FormData

- `currentPassword`
- `newPassword`
- `confirmPassword`

#### Validasi

- Password baru harus sama dengan konfirmasi
- Password lama harus cocok

### `getAdminUsers()`

Mengambil daftar pengguna admin.

#### Akses

- Hanya `superadmin`

### `createAdminUser(prevState, formData)`

Membuat user admin baru.

#### Field FormData

- `name`
- `email`
- `password`
- `role` - opsional, default `admin`

#### Akses

- Hanya `superadmin`

### `deleteAdminUser(id)`

Menghapus user admin berdasarkan ID.

#### Akses

- Hanya `superadmin`
- Tidak bisa menghapus akun sendiri

## Model Data Utama

### `User`

- `id`
- `name`
- `email`
- `password`
- `role`
- `avatar`
- `createdAt`
- `updatedAt`

### `Category`

- `id`
- `category_name`
- `createdAt`

### `Ticket`

- `id`
- `ticket_code` - format seperti `TIX-XXXXXX`
- `client_name`
- `client_email`
- `category_id`
- `title`
- `description`
- `attachment`
- `status` - default `Open`
- `priority`
- `createdAt`
- `updatedAt`

### `TicketReply`

- `id`
- `ticket_id`
- `user_id`
- `sender_type` - `admin`, `client`, atau `system`
- `message`
- `createdAt`

### `AISuggestion`

- `id`
- `ticket_id`
- `ai_summary`
- `ai_suggested_category`
- `ai_suggested_priority`
- `createdAt`

## Variabel Lingkungan

Variabel berikut dipakai oleh aplikasi:

- `DATABASE_URL` - koneksi database Prisma
- `NEXT_PUBLIC_APP_URL` - URL publik aplikasi
- `RECAPTCHA_SECRET_KEY` - aktivasi verifikasi CAPTCHA
- `SMTP_HOST` - host SMTP
- `SMTP_PORT` - port SMTP
- `SMTP_SECURE` - `true` atau `false`
- `SMTP_USER` - username SMTP
- `SMTP_PASS` - password SMTP
- `SMTP_FROM_NAME` - nama pengirim email

## Alur Penggunaan yang Disarankan

### Pengguna publik

1. Ambil kategori dengan `getCategories()`
2. Kirim tiket memakai `createTicket()`
3. Simpan kode tiket yang diterima
4. Lacak status tiket dengan `trackTicket(code)`
5. Jika perlu, kirim balasan lewat `replyClient(ticketId, message)`

### Admin

1. Login memakai `loginAdmin()`
2. Buka daftar tiket dan detail tiket
3. Perbarui status, prioritas, atau kategori dengan `updateTicket()`
4. Balas pelanggan dengan `replyAdmin()`
5. Kelola profil dengan `updateAdminProfile()` dan `changeAdminPassword()`
6. Jika role `superadmin`, kelola akun admin dengan `getAdminUsers()`, `createAdminUser()`, dan `deleteAdminUser()`

## Catatan Implementasi

- Lampiran disimpan di folder `public/uploads`
- Email tetap akan dicetak ke log jika SMTP belum dikonfigurasi
- Session admin memiliki masa hidup singkat, jadi login ulang mungkin diperlukan saat sesi habis
- Dokumentasi ini mengikuti implementasi saat ini, bukan kontrak REST publik yang terpisah
