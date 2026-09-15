# Chat pelanggan dan admin

## Status implementasi

Migrasi 20260915000000_guest_chat sudah diterapkan pada 15 September 2026.
Fitur belum diaktifkan di produksi; konfigurasi environment Vercel masih diperlukan.
Backup sebelum migrasi: backups/nays-2026-09-15T06-18-58.152Z.dump.
SHA256: F84912CF78D193D39BCDF5C5EEBE666FC6DA92DCBDA0F087647A02E3F2F06607.
Jangan mengaktifkan CHAT_ENABLED sebelum migrasi database selesai.
Kunci AI tidak disimpan dalam kode atau dikirim ke browser.

## Aktivasi

1. Buat backup produksi menggunakan scripts/backup-database.mjs.
2. Pastikan DATABASE_URL menunjuk database tujuan yang benar.
3. Jalankan npx prisma migrate deploy, lalu pastikan migrasi
   20260915000000_guest_chat tercatat berhasil.
4. Atur environment server pada Vercel:
   - CHAT_ENABLED=true
   - CHAT_GEMINI_API_KEY=<kunci milik pengelola>
   - CHAT_GEMINI_MODEL=gemini-2.5-flash (opsional)
   - CHAT_GROQ_API_KEY dan CHAT_GROQ_MODEL untuk fallback Groq (opsional).
   - CHAT_OPENROUTER_API_KEY dan CHAT_OPENROUTER_MODEL untuk fallback OpenRouter (opsional).
   - AUTH_SECRET dan DATABASE_URL tetap memakai konfigurasi yang ada.
5. Deploy/redeploy aplikasi, kemudian uji chat tamu dan inbox admin.
   Perubahan environment tidak langsung mengubah deployment lama.
6. Lakukan uji percakapan sintetis dengan model sungguhan sebelum
   membuka layanan kepada pelanggan.

CHAT_ENABLED yang kosong/false menyembunyikan widget dan membuat API
chat mengembalikan 503 sebelum mengakses tabel chat. Ketiadaan API key,
kegagalan model, atau informasi yang tidak pasti mengalihkan ke antrean admin.
Tidak ada klaim bahwa admin selalu online atau langsung membalas.

## Persetujuan penyedia

Pemilik menyetujui penggunaan Gemini, Groq, dan OpenRouter pada 15 September 2026.
Maksimal enam pesan terakhir serta fakta/katalog resmi dikirim ke penyedia aktif.
Hanya kegagalan permintaan atau respons tidak valid yang mencoba penyedia berikutnya.
Pilihan handoff yang valid langsung diarahkan ke admin, tanpa mencari jawaban lain.
Kunci diimpor lokal dengan node scripts/import-chat-env.mjs; skrip ini tidak mengirim
rahasia ke jaringan atau mengubah konfigurasi Vercel, database, maupun BOT_API_KEY.

## Penggunaan

Pelanggan membuka tombol Chat tanpa akun. Cookie HttpOnly, Secure di produksi,
SameSite Strict, dan token acak 256 bit mengidentifikasi sesi browser.
Database hanya menyimpan hash token. Token mentah tidak keluar melalui JSON.
Akhiri sesi memutus akses browser dengan mengganti hash token dan menghapus
cookie; riwayat masih tersedia bagi admin sampai sesi kedaluwarsa.

Admin membuka Dashboard > Chat Pelanggan, memilih percakapan, lalu Ambil alih.
AI berhenti dan hasil AI yang sedang diproses tidak boleh ditambahkan.
Hanya admin yang mengambil alih dapat membalas atau mengaktifkan AI kembali.
Admin lain tidak dapat mencuri kepemilikan chat secara diam-diam.
Indikator di sidebar menampilkan jumlah percakapan belum dibaca.
Polling percakapan/inbox setiap 5 detik dan badge setiap 15 detik;
polling berhenti ketika tab disembunyikan. Ini bukan push notification OS.

## Keamanan dan batasan

- Setiap mutasi memeriksa Origin dan input JSON maksimal 8 KiB.
- Pesan maksimal 2.000 karakter, tanpa HTML yang dapat dieksekusi.
- Pembatasan laju disimpan atomik di PostgreSQL, bukan memori Vercel.
- IP hanya diambil dari header proxy saat berjalan pada Vercel; yang disimpan
  adalah HMAC dengan AUTH_SECRET, bukan IP mentah.
- Per IP: 5 sesi baru/jam, 40 mutasi/10 menit, 180 pembacaan/menit.
- Per percakapan: 10 mutasi/menit. AI maksimal 300 panggilan/hari untuk aplikasi.
- Fallback berurutan: Gemini, Groq, OpenRouter; kunci kosong dilewati.
- Maksimal 6 detik per penyedia, batas waktu percobaan 18 detik total.
  Setiap percobaan dihitung dalam kuota 300 panggilan/hari.
  Job yang terputus dialihkan ke admin setelah 45 detik
  ketika percakapan berikutnya dibaca/dikirimi pesan.
- Idempotensi requestId mencegah pengiriman ulang menjadi pesan ganda.
- Semua mutasi pesan dan perubahan mode memakai compare-and-swap versi
  dalam transaksi database. Riwayat dipaginasi per 100 pesan.
- Pelanggan berhenti mengirim pada 300 pesan total percakapan; balasan
  admin dibatasi pada 350 pesan. WhatsApp tetap tersedia.
- Sesi berlaku 30 hari sejak dibuat. Akses dihentikan saat kedaluwarsa.
  Penghapusan fisik sesi kedaluwarsa dilakukan saat sesi baru dibuat;
  backup database dapat memiliki masa penyimpanan terpisah.
- Isi percakapan tidak ditulis ke console. Jangan mencatat cookie atau API key
  dalam log infrastruktur. Tinjau kebijakan penyimpanan penyedia AI sebelum aktivasi.
- Chat tidak membuat pesanan, mengurangi stok, atau menerima pembayaran.
- Fakta resmi ada di src/lib/chat-ai.ts, sesuai konfirmasi pemilik
  15 September 2026. Pembaruan kebijakan toko perlu diselaraskan juga dengan bot.
- Model hanya memilih ID fakta/produk. Harga berasal dari database.
  Kecocokan semantik jawaban tetap perlu dievaluasi; tidak dijamin 100%.
- Katalog lebih dari 500 produk aktif dialihkan ke admin, tidak dipotong diam-diam.

## Uji penyedia (15 September 2026)

Pertanyaan sintetis tanpa data pelanggan berhasil dijawab Gemini dan Groq.
Model OpenRouter lama openai/gpt-oss-120b:free tidak lagi terdaftar (HTTP 404).
Konfigurasi lokal website diperbarui ke google/gemma-4-26b-a4b-it:free;
uji model ini mendapat HTTP 429. Ketersediaan OpenRouter belum terverifikasi.
File env.txt milik bot tidak diubah. Impor ulang akan menolak menimpa model
website yang berbeda; ini disengaja untuk menjaga konfigurasi lokal.
Kunci belum disalin ke konfigurasi Vercel dan chat produksi belum diaktifkan.

## Verifikasi

npm test menjalankan tes website, migrasi terisolasi, dan keamanan chat.
Tes browser menggunakan fixture tests/ui dan respons AI simulasi:
tidak mengirim data pelanggan atau menguji kredensial AI produksi.
Fixture tidak menjadi route di deployment website utama.
Tanpa konfigurasi AI dan migrasi produksi, fitur belum siap dinyatakan live.

Referensi transport Gemini:
https://ai.google.dev/gemini-api/docs/generate-content/structured-output
