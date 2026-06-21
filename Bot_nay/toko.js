// =================================================================
//  toko.js — "Otak non-AI" untuk bot Nay's Cake
//  Tugas: baca produk.json, cari produk, parsing "10 risol",
//         hitung total (pakai kode, BUKAN Gemini), deteksi maksud.
//  Semua di sini gratis & instan — tidak memakai kuota Gemini.
// =================================================================
const fs = require('fs');
const path = require('path');

const PRODUK_FILE = path.join(__dirname, 'produk.json');

let PRODUK = [];
let INDEKS_NAMA = [];   // untuk pencarian cepat

// ---- Muat produk dari file (bisa di-reload tanpa restart) ----
function muatProduk() {
    try {
        const raw = fs.readFileSync(PRODUK_FILE, 'utf-8');
        PRODUK = JSON.parse(raw);
        // siapkan indeks nama ternormalisasi untuk pencarian
        INDEKS_NAMA = PRODUK.map(p => ({
            id: p.id,
            nama: p.nama,
            harga: p.harga,
            modal: p.modal || 0,
            pemasok: p.pemasok || '-',
            norm: normalisasi(p.nama),
            kata: normalisasi(p.nama).split(' ').filter(Boolean),
        }));
        return PRODUK.length;
    } catch (e) {
        console.error('Gagal memuat produk.json:', e.message);
        PRODUK = [];
        INDEKS_NAMA = [];
        return 0;
    }
}

// ---- Normalisasi teks: huruf kecil, buang tanda baca, rapikan spasi ----
function normalisasi(s) {
    return String(s || '')
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')   // tanda baca jadi spasi
        .replace(/\s+/g, ' ')
        .trim();
}

const rupiah = n => 'Rp' + (Number(n) || 0).toLocaleString('id-ID');

// =================================================================
// PENCARIAN PRODUK
// =================================================================
// Cari produk berdasarkan potongan nama. Mengembalikan SEMUA yang cocok
// (karena ada nama kembar beda pemasok), diurutkan dari paling relevan.
function cariProduk(teks) {
    const q = normalisasi(teks);
    if (!q) return [];
    const qKata = q.split(' ').filter(Boolean);

    const hasil = [];
    for (const p of INDEKS_NAMA) {
        let skor = 0;
        if (p.norm === q) skor = 100;                          // sama persis
        else if (p.norm.includes(q)) skor = 80;                // nama memuat query
        else if (q.includes(p.norm)) skor = 70;                // query memuat nama
        else {
            // hitung berapa kata query yang muncul di nama produk
            const cocok = qKata.filter(k => k.length >= 3 && p.kata.some(pk => pk.startsWith(k) || k.startsWith(pk)));
            if (cocok.length) skor = 40 + cocok.length * 5;
        }
        if (skor > 0) hasil.push({ ...p, skor });
    }
    hasil.sort((a, b) => b.skor - a.skor || a.nama.length - b.nama.length);
    return hasil;
}

// Ambil 1 produk terbaik; kalau ada beberapa skor tertinggi yang sama
// (mis. nama kembar beda harga), kembalikan daftar agar bisa ditanyakan.
function cocokkanSatu(teks) {
    const r = cariProduk(teks);
    if (!r.length) return { status: 'kosong', kandidat: [] };

    // kalau ada yang cocok PERSIS (skor 100), pakai itu — abaikan yang lain
    const persis = r.filter(x => x.skor === 100);
    if (persis.length) {
        const hargaUnik = [...new Set(persis.map(x => x.harga))];
        if (persis.length > 1 && hargaUnik.length > 1) {
            return { status: 'ambigu', kandidat: persis };   // nama kembar beda harga
        }
        return { status: 'ok', produk: persis[0], kandidat: persis };
    }

    const skorTop = r[0].skor;
    const top = r.filter(x => x.skor === skorTop);

    // beberapa produk BERBEDA cocok (mis. "risol" → banyak jenis) → minta pilih
    const namaUnik = [...new Set(top.map(x => x.nama))];
    if (namaUnik.length > 1) {
        return { status: 'pilih', kandidat: top };
    }

    // nama sama tapi harga beda → ambigu varian
    const hargaUnik = [...new Set(top.map(x => x.harga))];
    if (top.length > 1 && hargaUnik.length > 1) {
        return { status: 'ambigu', kandidat: top };
    }
    return { status: 'ok', produk: top[0], kandidat: top };
}

// =================================================================
// PARSING PESANAN  →  "risol 10, 2 dimsum"  jadi daftar item
// =================================================================
// Mendukung dua urutan: "nama angka" dan "angka nama".
// Pemisah antar item: koma, "dan", baris baru, titik koma.
// kata kerja niat yang harus diabaikan saat parsing
const KATA_NIAT = /\b(pesan|order|mau|mw|beli|booking|bungkus|ambil|minta|tolong|saya|aku|sy|kak|bu|min)\b/g;

function parsePesanan(teks) {
    // 1) Pisah antar-item DULU, selagi koma/dan/baris-baru masih ada.
    let kasar = String(teks || '')
        .toLowerCase()
        .replace(KATA_NIAT, ' ')
        .replace(/\bdan\b/g, ',')
        .split(/[,;\n]+/)
        .map(s => s.trim())
        .filter(Boolean);

    // 2) Pecah lagi bagian "nama angka nama angka" TANPA koma
    //    (mis. "dimsum 2 nagasari 5") → ["dimsum 2","nagasari 5"].
    //    Hanya pisah bila angka didahului huruf (= penutup item), lalu
    //    diikuti kata baru. Jadi "3 donat" (angka pembuka) tidak terpotong.
    const potong = [];
    for (const bagian of kasar) {
        const pisah = bagian.split(/(?<=[a-z]\s?\d{1,4})\s+(?=[a-z])/i);
        for (const x of pisah) { const xx = x.trim(); if (xx) potong.push(xx); }
    }

    const items = [];
    const gagal = [];

    for (const bagianRaw of potong) {
        const bagian = bagianRaw.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
        if (!bagian) continue;
        // pola "angka di depan": 10 risol  /  10 x risol  /  10 buah risol
        let m = bagian.match(/^(\d{1,4})\s*(?:x|buah|biji|pcs|porsi)?\s+(.+)$/i);
        let jumlah, namaTeks;
        if (m) {
            jumlah = parseInt(m[1], 10);
            namaTeks = m[2];
        } else {
            // pola "angka di belakang": risol 10  /  risol x10
            m = bagian.match(/^(.+?)\s*(?:x|sebanyak)?\s*(\d{1,4})\s*(?:x|buah|biji|pcs|porsi)?$/i);
            if (m) {
                namaTeks = m[1];
                jumlah = parseInt(m[2], 10);
            }
        }

        if (!jumlah || !namaTeks) { gagal.push(bagian); continue; }
        if (jumlah < 1 || jumlah > 9999) { gagal.push(bagian); continue; }

        const cocok = cocokkanSatu(namaTeks);
        if (cocok.status === 'kosong') { gagal.push(bagian); continue; }
        if (cocok.status === 'ambigu' || cocok.status === 'pilih') {
            items.push({ status: cocok.status, teksAsli: bagian, jumlah, kandidat: cocok.kandidat });
            continue;
        }
        const p = cocok.produk;
        items.push({
            status: 'ok',
            id: p.id, nama: p.nama, harga: p.harga, modal: p.modal, pemasok: p.pemasok,
            jumlah, subtotal: p.harga * jumlah,
        });
    }
    return { items, gagal };
}

// Hitung total dari hasil parse (hanya item berstatus ok)
function hitungTotal(items) {
    const ok = items.filter(i => i.status === 'ok');
    const total = ok.reduce((s, i) => s + i.subtotal, 0);
    const jumlahKue = ok.reduce((s, i) => s + i.jumlah, 0);
    return { total, jumlahKue, item: ok };
}

// =================================================================
// DETEKSI MAKSUD (INTENT) — menentukan apakah perlu Gemini atau tidak
// =================================================================
// Mengembalikan salah satu: 'pesan', 'harga', 'menu', 'lokasi',
// 'sapaan', atau 'lainnya' (yang ini baru diserahkan ke Gemini).
function deteksiMaksud(teks) {
    const t = normalisasi(teks);
    if (!t) return 'sapaan';

    // sapaan pendek / tidak jelas
    if (/^(p|y|ya|hi|hai|halo|hallo|hello|ping|test|assalamualaikum|asalamualaikum|oi|woi|min|admin|kak|bu|pagi|siang|sore|malam)\b/.test(t) && t.length <= 25) {
        return 'sapaan';
    }
    // niat memesan
    if (/\b(pesan|order|mau|beli|booking|bungkus|ambil)\b/.test(t) && /\d/.test(t)) return 'pesan';
    // tanya lokasi
    if (/\b(lokasi|alamat|dimana|di mana|maps|map|tempat|toko)\b/.test(t)) return 'lokasi';
    // minta daftar menu
    if (/\b(menu|daftar|list|jual apa|ada apa|katalog|produk)\b/.test(t)) return 'menu';
    // tanya harga
    if (/\b(harga|berapa|brp|price|hrg)\b/.test(t)) return 'harga';
    // ada angka + (mungkin) nama produk → kemungkinan mau pesan/hitung
    if (/\d/.test(t)) {
        const { items } = parsePesanan(teks);
        if (items.length) return 'pesan';
    }
    // kalau menyebut nama produk yang dikenal tanpa kata tanya → anggap tanya harga
    const r = cariProduk(teks);
    if (r.length && r[0].skor >= 70) return 'harga';

    return 'lainnya';   // → biar Gemini yang jawab
}

module.exports = {
    muatProduk,
    getProduk: () => PRODUK,
    normalisasi,
    rupiah,
    cariProduk,
    cocokkanSatu,
    parsePesanan,
    hitungTotal,
    deteksiMaksud,
};