# Verifikasi C3: Varian Mulus + Ganti Pesanan + Rekomendasi

## Status Implementasi
✅ **Semua bagian C3 sudah diimplementasikan**

Commit: `cb7effd` - feat(bot): varian mulus + ganti pesanan + rekomendasi (C3)

---

## Checklist Verifikasi Syntax

✅ **1. Syntax Check**
```bash
cd d:\nayscake_bersih\Bot_nay
node --check bot-nays-cake.js  # ✅ No errors
node --check toko.js            # ✅ No errors
node --check ai.js              # ✅ No errors
```

---

## Bagian A: Pemilihan Varian Mulus

### Implementasi:
1. ✅ Tahap `PILIH_VARIAN` ditambahkan ke state machine
2. ✅ `varianPending` menyimpan opsi varian dengan supplier & harga
3. ✅ Handler `tanganiPilihVarian()` mencocokkan jawaban:
   - Angka urutan (1, 2, 3...)
   - Harga ("2000", "yang 2000", "rp2000")
   - Nama supplier ("ade boy", "adeboy", "mas yanto")
4. ✅ Opsi ditampilkan dengan nomor untuk memudahkan
5. ✅ Setelah pilih → lanjut ke `PILIH_MODE` (tanya beli/pesan)

### Uji Manual (di WhatsApp):
```
SKENARIO 1: Pilih dengan harga
User: risol mayo 10
Bot: *Risol Mayo* ada 2 pilihan ya Kak:
     1. Ade Boy – Rp2.000
     2. Mas Yanto – Rp3.000
     Ketik angka (1/2), atau sebut harga/suppliernya 🙂
User: yang 2000
Bot: ✅ (paham → pilih Ade Boy, lanjut tanya beli/pesan)
     ❌ TIDAK loop minta sebut ulang

SKENARIO 2: Pilih dengan supplier
User: risol mayo 10
Bot: (tampilkan varian...)
User: ade boy
Bot: ✅ (paham → pilih Ade Boy)
     ❌ TIDAK ketemu "Pisang Adeboy"

SKENARIO 3: Pilih dengan nomor
User: risol mayo 10
Bot: (tampilkan varian...)
User: 1
Bot: ✅ (pilih varian pertama)
```

### Ekspektasi:
- ✅ "yang 2000" → bot paham (pilih produk Rp2.000)
- ✅ "ade boy" / "adeboy" → bot paham (pilih supplier Ade Boy)
- ✅ "1" / "2" → bot paham (pilih berdasarkan nomor)
- ❌ TIDAK loop minta sebut ulang
- ❌ TIDAK salah cocok ke produk lain ("Pisang Adeboy")

---

## Bagian B: Ganti Pesanan Saat Di Tengah Alur

### Implementasi:
1. ✅ Deteksi produk baru di semua tahap transaksi:
   - `PILIH_MODE`, `ISI_TANGGAL`, `KONFIRM_TANGGAL`
   - `PILIH_TOKO`, `KONFIRM_FINAL`, `PILIH_VARIAN`
2. ✅ Fungsi `toko.deteksiProdukBaru()` memeriksa validitas
3. ✅ Tahap `KONFIRM_GANTI` untuk konfirmasi
4. ✅ Handler `tanganiKonfirmGanti()`:
   - "ganti" → buang state lama, mulai dengan item baru
   - "lanjut" → kembali ke tahap sebelumnya
5. ✅ Simpan `tahapSebelumnya` dan `itemBaru` di state

### Uji Manual:
```
SKENARIO: Ganti di tengah alur
User: risol ayam 10
Bot: (ringkasan) Mau diambil sekarang (beli) atau dipesan?
User: dimsum 5  ← produk baru!
Bot: Kakak punya pesanan yang sedang diproses:
     • Risol Ayam × 10 = Rp30.000
     ────────────
     Total: Rp30.000
     
     Mau ganti ke pesanan baru:
     • Dimsum × 5 = Rp12.500
     ────────────
     Total: Rp12.500
     
     atau lanjutkan yang tadi?
     Ketik *ganti* atau *lanjut* ya 🙏

User: ganti
Bot: ✅ (mulai alur baru dengan dimsum 5)

User: lanjut
Bot: ✅ (kembali ke risol ayam, tanya beli/pesan lagi)
```

### Ekspektasi:
- ✅ Bot TIDAK mengabaikan produk baru
- ✅ Bot TANYA konfirmasi ganti/lanjut
- ✅ "ganti" → reset state, mulai baru
- ✅ "lanjut" → kembali ke tahap sebelumnya
- ✅ Ringkasan lama dan baru ditampilkan

---

## Bagian C: Rekomendasi Harga Fleksibel

### Implementasi:
1. ✅ Deteksi maksud `rekomendasi` di `toko.deteksiMaksud()`:
   - Budget: "punya 50rb", "budget 100ribu"
   - Jumlah tanpa produk: "mau 50 pcs", "buat 50 orang"
   - Minta saran: "enaknya pesan apa", "rekomendasi dong"
2. ✅ Tahap `TANYA_PREFERENSI` tanya manis/gurih (KODE)
3. ✅ Tahap `TAMPIL_REKOMENDASI` panggil AI
4. ✅ Helper `ai.rekomendasiProduk()` dengan larangan:
   - ❌ JANGAN hitung total akhir
   - ❌ JANGAN tulis NAY-xxxx
   - ❌ JANGAN buat pesanan
5. ✅ Filter produk berdasarkan preferensi
6. ✅ Fallback manual jika AI gagal/melanggar
7. ✅ Setelah rekomendasi → IDLE (pelanggan pesan normal)

### Uji Manual:
```
SKENARIO: Rekomendasi dengan budget
User: mau pesan 50 pcs buat arisan
Bot: Siap Kak! Kira-kira suka yang manis (kue basah, bolu) 
     atau gurih (gorengan, risol, lemper)? 
     Biar saya bantu pilihkan 😊
User: gurih
Bot: Untuk arisan gurih, ini beberapa pilihan enak nih 😊
     
     • Risol Mayo (Mas Yanto) – Rp3.000
     • Lemper Ayam – Rp3.500
     • Dimsum – Rp2.500
     
     Kalau Kakak mau pesan, tinggal sebut nama dan jumlahnya ya!
     
     📋 Menu lengkap: nayscake.vercel.app

User: risol mayo 20  ← pesan normal setelah rekomendasi
Bot: ✅ (masuk alur normal, total dihitung KODE)
     ❌ TIDAK ada NAY-xxxx dari AI
     ❌ TIDAK ada total dari AI
```

### Ekspektasi:
- ✅ Bot deteksi budget/jumlah/saran → tanya manis/gurih
- ✅ AI beri rekomendasi 2-4 produk + harga satuan
- ✅ Harga dari AI = saran saja (informatif)
- ✅ Pelanggan pesan → total dihitung KODE
- ❌ AI TIDAK hitung total akhir
- ❌ AI TIDAK tulis NAY-xxxx
- ✅ Setelah rekomendasi, alur normal berjalan

---

## Regresi: Alur C1/C2 Normal

### Harus Tetap Jalan:
```
SKENARIO 1: Beli langsung
User: risol ayam 10
Bot: (ringkasan) Mau diambil sekarang (beli) atau dipesan?
User: beli
Bot: ✅ Siap! Langsung mampir ke toko aja ya...

SKENARIO 2: Pesan dengan tanggal
User: dimsum 20
Bot: (ringkasan) Mau diambil sekarang (beli) atau dipesan?
User: pesan
Bot: Mau diambil tanggal & jam berapa?
User: 27 Des jam 10
Bot: Oke, saya catat untuk: Sabtu, 27 Des 2026, jam 10.00
     Sudah benar? (ya/ubah)
User: ya
Bot: Mau diambil di toko yang mana? 1️⃣ Utama / 2️⃣ Cabang
User: 1
Bot: Konfirmasi pesanan... (ketik ya/batal)
User: ya
Bot: ✅ Pesanan kamu sudah dicatat (No. NAY-xxxx)
     ❌ NAY-xxxx HARUS dari kode, BUKAN dari AI
```

---

## Checklist Verifikasi Lengkap

### Syntax & Build:
- [x] `node --check bot-nays-cake.js` ✅
- [x] `node --check toko.js` ✅
- [x] `node --check ai.js` ✅
- [ ] Bot bisa start tanpa crash
- [ ] Produk dimuat dari website/fallback

### Bagian A (Varian):
- [ ] "risol mayo 10" → tampil varian dengan nomor
- [ ] "yang 2000" → paham (pilih Rp2.000)
- [ ] "ade boy" → paham (pilih supplier)
- [ ] "1" → paham (pilih nomor 1)
- [ ] TIDAK loop minta sebut ulang
- [ ] TIDAK ketemu produk salah ("Pisang Adeboy")

### Bagian B (Ganti):
- [ ] Di PILIH_MODE: ketik produk baru → tanya ganti/lanjut
- [ ] Di ISI_TANGGAL: ketik produk baru → tanya ganti/lanjut
- [ ] "ganti" → reset, mulai baru
- [ ] "lanjut" → kembali ke tahap sebelumnya
- [ ] Ringkasan lama & baru ditampilkan

### Bagian C (Rekomendasi):
- [ ] "mau 50 pcs buat arisan" → tanya manis/gurih
- [ ] "budget 100rb" → tanya manis/gurih
- [ ] "rekomendasi dong" → tanya manis/gurih
- [ ] Jawab "gurih" → AI beri rekomendasi produk gurih
- [ ] AI TIDAK hitung total, TIDAK tulis NAY-xxxx
- [ ] Setelah rekomendasi, pesan normal → total dihitung KODE

### Regresi C1/C2:
- [ ] Beli langsung tetap jalan
- [ ] Pesan dengan tanggal tetap jalan
- [ ] Pilih toko tetap jalan
- [ ] Konfirmasi final tetap jalan
- [ ] NAY-xxxx dari KODE, bukan AI

---

## Cara Testing

### 1. Start Bot:
```bash
cd d:\nayscake_bersih\Bot_nay
node bot-nays-cake.js
```

### 2. Scan QR dengan WhatsApp

### 3. Jalankan Skenario di Atas

### 4. Monitor Log:
- Console: `[PILIH_VARIAN]`, `[KONFIRM_GANTI]`, `[REKOMENDASI]`
- File log: `logs/YYYY-MM-DD.log`

---

## Jika Ada Bug

### Bug Varian:
- Cek: `tanganiPilihVarian()` di bot-nays-cake.js
- Cek: `varianPending` di state percakapan
- Cek: pencocokan harga/supplier

### Bug Ganti:
- Cek: `toko.deteksiProdukBaru()` di toko.js
- Cek: kondisi `tahapBisaGanti` di prosesGabungan
- Cek: `tanganiKonfirmGanti()` di bot-nays-cake.js

### Bug Rekomendasi:
- Cek: `toko.deteksiMaksud()` → return 'rekomendasi'
- Cek: `ai.rekomendasiProduk()` di ai.js
- Cek: filter produk manis/gurih
- Cek: prompt AI (larangan ketat)

---

## Catatan Penting

1. **API Key**: Pastikan `.env` memiliki minimal 1 API key (GEMINI/GROQ/OPENROUTER)
2. **Produk**: Bot harus bisa muat produk dari website atau fallback ke produk.json
3. **Larangan AI**: AI hanya beri rekomendasi, TIDAK boleh hitung total atau tulis NAY-xxxx
4. **State Timeout**: Percakapan auto-reset setelah 10 menit idle

---

## Deploy ke Production

Jika semua verifikasi lolos:

```bash
cd d:\nayscake_bersih
git push origin main
# Deploy ke Pella atau server production
```

Laporkan hasil uji dengan checklist di atas.
