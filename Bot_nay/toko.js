// =================================================================
//  toko.js — "Otak non-AI" untuk bot Nay's Cake
//  Tugas: baca produk dari website, cari produk, parsing "10 risol",
//         hitung total (pakai kode, BUKAN Gemini), deteksi maksud.
//  Semua di sini gratis & instan — tidak memakai kuota Gemini.
// =================================================================
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const PRODUK_FILE = path.join(__dirname, 'produk.json');

let PRODUK = [];
let INDEKS_NAMA = [];   // untuk pencarian cepat

// Cache untuk produk dari web
let CACHE_WAKTU = 0;
let CACHE_SUMBER = 'FILE'; // 'WEB' atau 'FILE'
const CACHE_MENIT = parseInt(process.env.PRODUK_CACHE_MENIT || '10', 10);
const WEB_BASE_URL = process.env.WEB_BASE_URL || 'https://nayscake.vercel.app';

// ---- Muat produk dari website (async) ----
async function muatProdukDariWeb() {
    try {
        const response = await axios.get(`${WEB_BASE_URL}/api/products`, {
            timeout: 10000, // 10 detik timeout
        });
        
        if (response.status !== 200 || !response.data?.products) {
            throw new Error('Respons tidak valid');
        }
        
        // Map field dari website ke format internal bot
        PRODUK = response.data.products.map(p => ({
            id: p.id,                  // CUID string dari database
            nama: p.name,
            harga: p.sellingPrice,
            modal: p.costPrice || 0,
            pemasok: p.supplier || '-',
            stock: p.stock || 0,
        }));
        
        // Simpan ke file sebagai cadangan terbaru
        fs.writeFileSync(PRODUK_FILE, JSON.stringify(PRODUK, null, 2));
        
        CACHE_WAKTU = Date.now();
        CACHE_SUMBER = 'WEB';
        console.log(`[PRODUK] dimuat dari WEB (${PRODUK.length})`);
        
        bangunIndeks();
        return PRODUK.length;
    } catch (e) {
        console.warn(`[PRODUK] Gagal ambil dari WEB (${e.message}) → pakai cadangan`);
        CACHE_SUMBER = 'CADANGAN';
        return muatProduk(); // fallback ke file
    }
}

// ---- Muat produk dari file (sinkron, fallback) ----
function muatProduk() {
    try {
        const raw = fs.readFileSync(PRODUK_FILE, 'utf-8');
        PRODUK = JSON.parse(raw);
        CACHE_SUMBER = PRODUK.length > 0 ? 'CADANGAN' : 'KOSONG';
        console.log(`[PRODUK] dimuat dari ${CACHE_SUMBER === 'CADANGAN' ? 'CADANGAN produk.json' : 'FILE'} (${PRODUK.length})`);
        bangunIndeks();
        return PRODUK.length;
    } catch (e) {
        console.error('[PRODUK] Gagal memuat produk.json:', e.message);
        PRODUK = [];
        INDEKS_NAMA = [];
        CACHE_SUMBER = 'ERROR';
        return 0;
    }
}

// ---- Bangun indeks nama (dipanggil setelah produk dimuat) ----
function bangunIndeks() {
    INDEKS_NAMA = PRODUK.map(p => ({
        id: p.id,
        nama: p.nama,
        harga: p.harga,
        modal: p.modal || 0,
        pemasok: p.pemasok || '-',
        norm: normalisasi(p.nama),
        kata: normalisasi(p.nama).split(' ').filter(Boolean),
    }));
}

// ---- Cek apakah perlu refresh cache ----
async function cekDanRefreshCache() {
    const now = Date.now();
    const selang = CACHE_MENIT * 60 * 1000;
    
    if (PRODUK.length === 0 || (now - CACHE_WAKTU) > selang) {
        console.log(`[PRODUK] Cache expired (${CACHE_MENIT} menit), refresh...`);
        await muatProdukDariWeb();
        return true;
    }
    return false;
}

// ---- Refresh paksa dari web ----
async function forceRefresh() {
    return await muatProdukDariWeb();
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
// 'sapaan', 'rekomendasi', atau 'lainnya' (yang ini baru diserahkan ke Gemini).
function deteksiMaksud(teks) {
    const t = normalisasi(teks);
    if (!t) return 'sapaan';

    // sapaan pendek / tidak jelas
    if (/^(p|y|ya|hi|hai|halo|hallo|hello|ping|test|assalamualaikum|asalamualaikum|oi|woi|min|admin|kak|bu|pagi|siang|sore|malam)\b/.test(t) && t.length <= 25) {
        return 'sapaan';
    }
    // niat memesan (ada kata kerja + angka jumlah → pasti pesanan, jangan dilewati)
    if (/\b(pesan|order|mau|beli|booking|bungkus|ambil)\b/.test(t) && /\d/.test(t)) return 'pesan';
    // tanya lokasi
    if (/\b(lokasi|alamat|dimana|di mana|maps|map|tempat|toko)\b/.test(t)) return 'lokasi';
    // minta daftar menu
    if (/\b(menu|daftar|list|jual apa|ada apa|katalog|produk)\b/.test(t)) return 'menu';

    // ---- DETEKSI REKOMENDASI (C3) ----
    // Budget: "punya 50rb", "budget 100ribu", "duit 200rb"
    // Jumlah tanpa produk: "mau 50 pcs", "buat 50 orang", "butuh 30 biji"
    // Minta saran: "enaknya pesan apa", "rekomendasi dong", "saran kue", "kue apa yang enak"
    const adaBudget = /\b(budget|punya|duit|modal|uang)\s*\d+\s*(rb|ribu|k)/i.test(teks);
    const adaJumlahTanpaProduk = /\b(mau|butuh|buat|untuk)\s*\d+\s*(pcs?|buah|biji|orang|porsi|item)/i.test(teks);
    const mintaSaran = /\b(enaknya|rekomendasi|saran|bagusnya|pilihan|apa yang enak|apa ya|mau pesan apa|kue apa)\b/i.test(t);
    if (adaBudget || adaJumlahTanpaProduk || mintaSaran) return 'rekomendasi';

    // ---- GUARD: kata kunci non-harga → lempar ke AI, jangan tangkap sebagai harga ----
    const KATA_KUNCI_KE_AI = /\b(tahan|berapa lama|basi|awet|halal|kandungan|alergi|kacang|gluten|pengawet|sehat|bisa di|kenapa|kok|apakah|expired|kadaluarsa|kadaluwarsa|komposisi|bahan|simpan|disimpan)\b/;
    const adaKataKunciAI = KATA_KUNCI_KE_AI.test(t);

    // tanya harga (hanya jika BUKAN pertanyaan non-harga)
    if (!adaKataKunciAI && /\b(harga|berapa|brp|price|hrg)\b/.test(t)) return 'harga';
    // ada angka + (mungkin) nama produk → kemungkinan mau pesan/hitung
    if (/\d/.test(t)) {
        const { items } = parsePesanan(teks);
        if (items.length) return 'pesan';
    }
    // kalau menyebut nama produk yang dikenal tanpa kata tanya → anggap tanya harga
    // TAPI jika ada kata kunci non-harga, langsung ke AI
    if (!adaKataKunciAI) {
        const r = cariProduk(teks);
        if (r.length && r[0].skor >= 70) return 'harga';
    }

    return 'lainnya';   // → biar Gemini yang jawab
}

// =================================================================
// DETEKSI PRODUK BARU (untuk BAGIAN B - ganti pesanan)
// Cek apakah teks mengandung pesanan produk baru yang valid.
// Mengembalikan { items, gagal } jika valid, atau null jika bukan pesanan.
// =================================================================
function deteksiProdukBaru(teks) {
    const t = normalisasi(teks);
    if (!t) return null;
    
    // Jika tidak ada angka, kemungkinan bukan pesanan
    if (!/\d/.test(t)) return null;
    
    const { items, gagal } = parsePesanan(teks);
    
    // Harus ada minimal 1 item valid
    const okItems = items.filter(i => i.status === 'ok' || i.status === 'ambigu' || i.status === 'pilih');
    if (okItems.length === 0) return null;
    
    return { items, gagal };
}

// =================================================================
// DETEKSI PREFERENSI JENIS KUE (manis/gurih) untuk rekomendasi
// =================================================================
function deteksiPreferensi(teks) {
    const t = normalisasi(teks);
    
    const manis = /\b(manis|kue basah|bolu|cake|brownis|lapis|talam|nagasari|lemper manis|kue lapis|dadar|kue bolu|puding|es krim|coklat|cokelat|vanila|keju|pisang|sus)\b/i;
    const gurih = /\b(gurih|gorengan|risol|lemper|dimsum|pastel|lumpia|tahu|tempe|bakso|mie|ayam|daging|udang|bakar|pangsit|siomay)\b/i;
    
    if (manis.test(teks) && !gurih.test(teks)) return 'manis';
    if (gurih.test(teks) && !manis.test(teks)) return 'gurih';
    if (manis.test(teks) && gurih.test(teks)) return 'campur';
    
    return null; // tidak terdeteksi
}

// ---- Getter untuk sumber cache ----
function getSumberCache() {
    return CACHE_SUMBER;
}

module.exports = {
    muatProduk,
    muatProdukDariWeb,
    cekDanRefreshCache,
    forceRefresh,
    getProduk: () => PRODUK,
    getSumberCache,
    normalisasi,
    rupiah,
    cariProduk,
    cocokkanSatu,
    parsePesanan,
    hitungTotal,
    deteksiMaksud,
    deteksiProdukBaru,
    deteksiPreferensi,
};
