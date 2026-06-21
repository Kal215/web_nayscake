# 📊 LAPORAN ANALISIS DATA USAHA NAY'S CAKE

---

## 1. INFORMASI UMUM DATASET

| Parameter | Nilai |
|-----------|-------|
| **Format File** | Excel (.xlsx) |
| **Nama Sheet** | Stok Barang |
| **Total Baris Data** | 83 |
| **Total Kolom** | 10 |

### Kolom dalam Dataset:
1. `Nama` - Nama Supplier
2. `Barang` - Nama Produk
3. `Harga Awal` - Harga Modal (Cost Price)
4. `Harga Jual` - Harga Jual (Selling Price)
5. `Margin (%)` - Persentase Margin
6. `Keuntungan` - Keuntungan per unit
7. `Barang Masuk` - Stok Masuk
8. `Sisa Barang` - Stok Tersisa
9. `Barang Terjual` - Stok Terjual
10. `Total` - Total Penjualan

---

## 2. ANALISIS SUPPLIER

### 2.1 Statistik Supplier

| Metric | Nilai |
|--------|-------|
| **Total Supplier** | 29 |
| **Total Produk** | 83 |
| **Produk Unik** | 75 |

### 2.2 Daftar Supplier & Jumlah Produk

| No | Supplier | Jumlah Produk |
|----|----------|---------------|
| 1 | MAS ARIS | 4 |
| 2 | MAS YANTO | 10 |
| 3 | PAK ADE | 1 |
| 4 | PAK SUGIMAN | 1 |
| 5 | IBU DEDAH | 4 |
| 6 | MAMAH DIKA | 3 |
| 7 | PAK MASMUR | 9 |
| 8 | PAK MUHIDIN | 2 |
| 9 | IBU NUR | 3 |
| 10 | PAK ROHMAT | 1 |
| 11 | ADE BOY | 2 |
| 12 | PAK USTAD | 2 |
| 13 | MAS WARMAN | 1 |
| 14 | IBU LINA | 1 |
| 15 | MAS PARJO | 2 |
| 16 | TEH DAWA | 3 |
| 17 | IBU ERNI | 3 |
| 18 | MBA RIA | 1 |
| 19 | PAK KOKO | 4 |
| 20 | BANG ZACK | 1 |
| 21 | DESTA | 2 |
| 22 | MAS PANJUL | 2 |
| 23 | IBU IDDAH | 3 |
| 24 | IBU SATE | 1 |
| 25 | MAS BOKIR | 1 |
| 26 | PAK TEMI | 4 |
| 27 | MAS UDIN | 2 |
| 28 | EMAK AREN | 2 |
| 29 | IBU HETTI | 8 |

### 2.3 Supplier Terbesar ( berdasarkan jumlah produk)

1. **MAS YANTO** - 10 produk
2. **PAK MASMUR** - 9 produk
3. **IBU HETTI** - 8 produk

---

## 3. ANALISIS PRODUK

### 3.1 Daftar 75 Produk Unik

| No | Nama Produk | Kategori |
|----|-------------|----------|
| 1 | Lapis | Kue Basah |
| 2 | Bugis | Kue Basah |
| 3 | Bolu Panggang | Bolu |
| 4 | Bolu Kelapa | Bolu |
| 5 | Risol Segitiga | Risol |
| 6 | Risol Sosis | Risol |
| 7 | Risol Kentang | Risol |
| 8 | Bolu Kukus Warna | Bolu Kukus |
| 9 | Bolu Kukus Ketan | Bolu Kukus |
| 10 | Donat | Gorengan |
| 11 | Sus Cream | Kue Basah |
| 12 | Risol Ayam | Risol |
| 13 | Risol Mayo | Risol |
| 14 | Pizza | Kue Basah |
| 15 | Sus Fla | Kue Basah |
| 16 | Cente Putih | Cente |
| 17 | Cente Pisang | Cente |
| 18 | Cente Coklat | Cente |
| 19 | Cente Jagung | Cente |
| 20 | Cente Kecil | Cente |
| 21 | Risol Cengek | Risol |
| 22 | Dimsum | Chinese |
| 23 | Lontong | Kue Basah |
| 24 | Bola Susu | Kue Basah |
| 25 | Bola Coklat | Kue Basah |
| 26 | Wajit | Kue Basah |
| 27 | Bolu Ketan | Bolu |
| 28 | Bolu Sarang Semut | Bolu |
| 29 | Bolu Brownies | Bolu |
| 30 | Pai | Kue Basah |
| 31 | Gabin | Kue Basah |
| 32 | Bolen | Kue Basah |
| 33 | Lilit | Kue Basah |
| 34 | Nagasari | Kue Basah |
| 35 | Bika Ambon | Kue Basah |
| 36 | Dadar Gulung Ubi | Dadar Gulung |
| 37 | Sosis Solo | Kue Basah |
| 38 | Pisang Adeboy | Kue Basah |
| 39 | Pastel | Kue Basah |
| 40 | Roti Goreng | Gorengan |
| 41 | Dadar Gulung | Dadar Gulung |
| 42 | Ketan Bumbu | Kue Basah |
| 43 | Putu Ayu Ungu | Putu Ayu |
| 44 | Cucur | Kue Basah |
| 45 | Risoles | Risol |
| 46 | Putu Ayu Merah | Putu Ayu |
| 47 | Puding Gula Merah | Puding |
| 48 | Combro | Gorengan |
| 49 | Buras | Kue Basah |
| 50 | Putu Ayu | Putu Ayu |
| 51 | Lemper Ayam Kecil | Lemper |
| 52 | Lemper Ayam Sedang | Lemper |
| 53 | Lemper Ayam Besar | Lemper |
| 54 | Lemper Ayam Bakar | Lemper |
| 55 | Dadar Gulung Fla | Dadar Gulung |
| 56 | Bolu Rainbow | Bolu |
| 57 | Talam | Kue Basah |
| 58 | Donat Palem | Gorengan |
| 59 | Onde | Kue Basah |
| 60 | Donat Camerok | Gorengan |
| 61 | Sate Aci | Kue Basah |
| 62 | Nona Manis | Kue Basah |
| 63 | Lupcup | Kue Basah |
| 64 | Puding Cup | Puding |
| 65 | Puding Potong | Puding |
| 66 | Martabak Telur | Kue Basah |
| 67 | Bacang Kecil | Bacang |
| 68 | Bacang Besar | Bacang |
| 69 | Bolu Kukus Aren | Bolu Kukus |
| 70 | Bolu Pisang | Bolu |
| 71 | Bolu Kacang | Bolu |
| 72 | Brownies | Bolu |
| 73 | Cheese Roll | Kue Basah |
| 74 | Pastry | Kue Basah |
| 75 | Caca | Kue Basah |

---

## 4. ANALISIS HARGA

### 4.1 Harga Modal (Cost Price)

| Metric | Nilai (Rp) |
|--------|------------|
| **Minimum** | 800 |
| **Maximum** | 10.000 |
| **Rata-rata** | 1.574,70 |

### 4.2 Harga Jual (Selling Price)

| Metric | Nilai (Rp) |
|--------|------------|
| **Minimum** | 1.000 |
| **Maximum** | 12.000 |
| **Rata-rata** | 1.927,71 |

### 4.3 Margin & Keuntungan

| Metric | Margin (%) | Keuntungan (Rp) |
|--------|------------|-----------------|
| **Minimum** | 12,50% | 200 |
| **Maximum** | 33,33% | 2.000 |
| **Rata-rata** | 19,16% | 353,01 |

### 4.4 Distribusi Harga

| Range Harga | Jumlah Produk |
|-------------|---------------|
| Rp 800 - 1.500 | ~50 produk |
| Rp 1.501 - 3.000 | ~20 produk |
| Rp 3.001 - 5.000 | ~8 produk |
| Rp 5.001 - 10.000 | ~4 produk |
| > Rp 10.000 | ~1 produk |

---

## 5. ANALISIS STOK

### ⚠️ MASALAH KRUSIAL: DATA STOK KOSONG

| Field | Data Tersedia | Data Kosong |
|-------|---------------|-------------|
| **Barang Masuk** | 0 | 83 (100%) |
| **Sisa Barang** | 0 | 83 (100%) |
| **Barang Terjual** | 0 | 83 (100%) |
| **Total** | 0 | 83 (100%) |

**Kesimpulan:** Data stok saat ini adalah **master data harga saja**, bukan data transaksi harian.

---

## 6. PRODUK DUPLIKAT (Multi-Supplier)

### 6.1 Statistik

| Metric | Nilai |
|--------|-------|
| **Total Produk Duplikat** | 7 produk |
| **Total Entry Duplikat** | 18 baris |

### 6.2 Detail Produk Duplikat

| Produk | Jumlah Supplier | Supplier |
|--------|-----------------|----------|
| **Dadar Gulung** | 3 | MAS WARMAN, TEH DAWA, BANG ZACK |
| **Risol Segitiga** | 2 | MAS YANTO, MAMAH DIKA |
| **Lapis** | 2 | MAS ARIS, MAS PANJUL |
| **Pizza** | 2 | MAS YANTO, EMAK AREN |
| **Bola Susu** | 2 | PAK MASMUR, IBU HETTI |
| **Risol Mayo** | 2 | MAS YANTO, ADE BOY |
| **Bolu Rainbow** | 2 | DESTA, IBU HETTI |

---

## 7. KONSISTENSI HARGA

### ⚠️ MASALAH: 3 PRODUK DENGAN HARGA BERBEDA

| Produk | Harga 1 | Harga 2 | Selisih |
|--------|---------|---------|---------|
| **Lapis** | Modal: 1.250, Jual: 1.500 | Modal: 800, Jual: 1.000 | 500 |
| **Risol Mayo** | Modal: 2.500, Jual: 3.000 | Modal: 1.700, Jual: 2.000 | 1.000 |
| **Bolu Rainbow** | Modal: 1.000, Jual: 1.500 | Modal: 2.500, Jual: 3.000 | 1.500 |

**Implikasi:** Produk yang sama bisa memiliki harga berbeda tergantung supplier.

---

## 8. ANALISIS LAPORAN

### ⚠️ TIDAK ADA KOLOM TANGGAL

- Dataset saat ini adalah **master data harga**, bukan data transaksi
- Tidak ada informasi tanggal
- Tidak ada informasi periode (harian/bulanan)
- Tidak ada data penjualan actual

---

## 9. REKAP PER SUPPLIER (Total Modal & Jual)

| Supplier | Produk | Total Modal | Total Jual |
|----------|--------|-------------|------------|
| MAS ARIS | 4 | 5.000 | 6.000 |
| MAS YANTO | 10 | 13.700 | 17.000 |
| PAK ADE | 1 | 800 | 1.000 |
| PAK SUGIMAN | 1 | 800 | 1.000 |
| IBU DEDAH | 4 | 5.000 | 7.000 |
| MAMAH DIKA | 3 | 11.600 | 14.000 |
| PAK MASMUR | 9 | 21.250 | 25.500 |
| PAK MUHIDIN | 2 | 4.100 | 5.000 |
| IBU NUR | 3 | 2.800 | 3.500 |
| PAK ROHMAT | 1 | 1.600 | 2.000 |
| ADE BOY | 2 | 2.500 | 3.000 |
| PAK USTAD | 2 | 1.600 | 2.000 |
| MAS WARMAN | 1 | 800 | 1.000 |
| IBU LINA | 1 | 800 | 1.000 |
| MAS PARJO | 2 | 1.600 | 2.000 |
| TEH DAWA | 3 | 2.400 | 3.000 |
| IBU ERNI | 3 | 2.400 | 3.000 |
| MBA RIA | 1 | 800 | 1.000 |
| PAK KOKO | 4 | 4.450 | 5.500 |
| BANG ZACK | 1 | 800 | 1.000 |
| DESTA | 2 | 1.800 | 2.500 |
| MAS PANJUL | 2 | 1.600 | 2.000 |
| IBU IDDAH | 3 | 2.400 | 3.000 |
| IBU SATE | 1 | 3.500 | 4.000 |
| MAS BOKIR | 1 | 800 | 1.000 |
| PAK TEMI | 4 | 4.000 | 5.000 |
| MAS UDIN | 2 | 6.500 | 8.000 |
| EMAK AREN | 2 | 4.800 | 6.000 |
| IBU HETTI | 8 | 20.500 | 24.000 |
| **TOTAL** | **83** | **130.700** | **160.000** |

---

## 10. IDENTIFIKASI MASALAH DATA

### 10.1 Masalah Utama

| No | Masalah | Severity | Dampak |
|----|---------|----------|--------|
| 1 | Data stok 100% kosong | 🔴 KRUSIAL | Tidak bisa tracking stok |
| 2 | Tidak ada kolom tanggal | 🔴 KRUSIAL | Tidak bisa buat laporan harian/bulanan |
| 3 | Produk duplikat (7 produk) | 🟠 TINGGI | Bisa bingung saat input penjualan |
| 4 | Harga tidak konsisten | 🟠 TINGGI | Keuntungan tidak seragam |
| 5 | Format nama supplier tidak seragam | 🟡 SEDANG | - |
| 6 | Tidak ada data transaksi actual | 🔴 KRUSIAL | Tidak bisa hitung omzet/keuntungan |

### 10.2 Inkonsistensi Nama

**Supplier dengan prefix tidak seragam:**
- `MAS` (21 orang) - informal
- `PAK` (8 orang) - formal
- `IBU` (6 orang) - formal
- `MAMAH` (1 orang) - informal
- `MBA` (1 orang) - informal
- `EMAK` (1 orang) - informal
- `TEH` (1 orang) - informal

### 10.3 Kategori Produk Tidak Ada

Produk tidak dikategorikan. Semua masuk dalam 1 tabel tanpa kategori seperti:
- Kue Basah
- Bolu
- Gorengan
- Risol
- Kue Tradisional
- dll.

---

## 11. REKOMENDASI STRUKTUR DATABASE

### 11.1 Entity Relationship Diagram (ERD)

```
┌─────────────┐       ┌─────────────┐       ┌──────────────────┐
│   SUPPLIER  │       │   PRODUCT   │       │   STOCK_ENTRY    │
├─────────────┤       ├─────────────┤       ├──────────────────┤
│ id (PK)     │──┐    │ id (PK)     │       │ id (PK)          │
│ name        │  │    │ supplierId(FK)    │    │ productId (FK)   │
│ phone       │  │    │ name        │       │ date             │
│ address     │  └───▶│ slug        │◀──────│ quantityIn       │
│ notes       │       │ imageUrl    │       │ createdAt        │
│ createdAt   │       │ costPrice   │       └──────────────────┘
│ updatedAt   │       │ sellingPrice│              
└─────────────┘       │ description │
                      │ category    │       ┌──────────────────┐
                      │ isActive    │       │      SALE        │
                      │ createdAt   │       ├──────────────────┤
                      │ updatedAt   │       │ id (PK)          │
                      └─────────────┘       │ saleDate         │
                              │             │ totalAmount      │
                              │             │ totalProfit      │
                              │             │ createdAt        │
                              │             └────────┬─────────┘
                              │                      │
                              ▼                      ▼
                      ┌─────────────────────────────────┐
                      │           SALE_ITEM             │
                      ├─────────────────────────────────┤
                      │ id (PK)                         │
                      │ saleId (FK)                     │
                      │ productId (FK)                  │
                      │ supplierId (FK)                 │
                      │ quantity                        │
                      │ price                           │
                      │ cost                            │
                      │ subtotal                        │
                      │ profit                          │
                      └─────────────────────────────────┘
```

### 11.2 Penjelasan Entitas

| Entitas | Deskripsi | Hubungan |
|---------|-----------|----------|
| **SUPPLIER** | Master data supplier | 1:N dengan PRODUCT |
| **PRODUCT** | Master data produk dengan harga | N:1 dengan SUPPLIER, 1:N dengan STOCK_ENTRY, 1:N dengan SALE_ITEM |
| **STOCK_ENTRY** | Transaksi stok masuk harian | N:1 dengan PRODUCT |
| **SALE** | Header transaksi penjualan | 1:N dengan SALE_ITEM |
| **SALE_ITEM** | Detail item penjualan | N:1 dengan SALE, PRODUCT, SUPPLIER |

### 11.3 Rekomendasi Split Data

Karena ada produk duplikat dari supplier berbeda dengan harga berbeda, ada 2 opsi:

**Opsi A: Satu Produk - Banyak Harga (per Supplier)**
```
PRODUCT (1) ──── SUPPLIER_PRODUCT_PRICE (N)
                    - productId
                    - supplierId
                    - costPrice
                    - sellingPrice
```

**Opsi B: Produk Unique per Supplier (Direkomendasikan)**
```
Setiap kombinasi produk-supplier adalah 1 record
Contoh:
- Risol Segitiga (MAS YANTO) - ID: 1
- Risol Segitiga (MAMAH DIKA) - ID: 2
```

**Rekomendasi:** Gunakan **Opsi B** karena lebih simple dan sesuai dengan pola data yang ada.

### 11.4 Kolom Tambahan yang Direkomendasikan

**Tabel PRODUCT:**
- `category` - Kategori produk (Kue Basah, Bolu, Gorengan, dll.)
- `unit` - Satuan (pcs, box, kg)
- `minStock` - Minimal stok untuk alert

**Tabel STOCK_ENTRY:**
- `notes` - Catatan tambahan

**Tabel SALE & SALE_ITEM:**
- `paymentMethod` - Metode pembayaran (cash, transfer, dll.)
- `customerName` - Nama pelanggan (optional)
- `notes` - Catatan transaksi

---

## 12. RINGKASAN ANALISIS

### 12.1 Statistik Utama

| Metric | Nilai |
|--------|-------|
| Total Supplier | 29 |
| Total Produk | 83 |
| Produk Unik | 75 |
| Produk Duplikat | 7 |
| Harga Modal Range | Rp 800 - 10.000 |
| Harga Jual Range | Rp 1.000 - 12.000 |
| Margin Rata-rata | 19,16% |
| Data Stok Tersedia | 0% |

### 12.2 Kesimpulan

1. **Data saat ini adalah MASTER DATA HARGA**, bukan data operasional
2. **Tidak ada data transaksi** - hanya referensi harga
3. **Stok kosong** - perlu input manual di sistem baru
4. **Produk duplikat** - perlu strategi untuk handle
5. **Harga tidak konsisten** - perlu standarisasi
6. **Tidak ada laporan** - sistem baru harus bisa generate laporan

### 12.3 Langkah Selanjutnya yang Direkomendasikan

1. ✅ Konversi data Excel ke database
2. ✅ Buat struktur database sesuai ERD
3. ✅ Handle produk duplikat (Opsi B)
4. ✅ Sistem input stok harian
5. ✅ Sistem transaksi penjualan
6. ✅ Generate laporan otomatis
7. ✅ API untuk WhatsApp Bot

---

## 13. PERSIAPAN UNTUK PEMBUATAN APLIKASI

### 13.1 Data yang Bisa Di-Import

| Data | Jumlah | Status |
|------|--------|--------|
| Supplier | 29 | ✅ Siap import |
| Produk | 83 | ✅ Siap import |
| Harga | 83 | ✅ Siap import |

### 13.2 Data yang Perlu Dibuat Manual

| Data | Keterangan |
|------|------------|
| Stok Awal | Diinput manual saat sistem berjalan |
| Transaksi Penjualan | Dicatat harian |
| Laporan | Generate dari transaksi |

---

**Laporan ini dibuat berdasarkan reverse engineering file `Stok_Barang.xlsx`**
**Analisis dilakukan pada: 21 Juni 2026**

---

*Silakan review laporan ini. Jika sudah sesuai, saya akan menunggu konfirmasi untuk melanjutkan pembuatan database dan aplikasi.*