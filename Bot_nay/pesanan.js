// =================================================================
//  pesanan.js — Pencatatan pesanan pelanggan ke pesanan.json
//  Status: menunggu (baru masuk) → dikonfirmasi / dibatalkan.
// =================================================================
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'pesanan.json');

function baca() {
    try {
        if (!fs.existsSync(FILE)) return [];
        return JSON.parse(fs.readFileSync(FILE, 'utf-8')) || [];
    } catch (e) {
        console.error('Gagal baca pesanan.json:', e.message);
        return [];
    }
}

function tulis(arr) {
    try {
        const tmp = FILE + '.tmp';
        fs.writeFileSync(tmp, JSON.stringify(arr, null, 2));
        fs.renameSync(tmp, FILE);
        return true;
    } catch (e) {
        console.error('Gagal tulis pesanan.json:', e.message);
        return false;
    }
}

// Nomor pesanan ringkas & urut: NAY-0001, NAY-0002, ...
function nomorBaru(arr) {
    let maks = 0;
    for (const p of arr) {
        const m = String(p.nomor || '').match(/(\d+)$/);
        if (m) maks = Math.max(maks, parseInt(m[1], 10));
    }
    return 'NAY-' + String(maks + 1).padStart(4, '0');
}

// Tambah pesanan baru. `jid` = nomor WA pelanggan, `item` = array {nama,jumlah,harga,subtotal}
function tambah(jid, item, total) {
    const arr = baca();
    const nomor = nomorBaru(arr);
    const rec = {
        nomor,
        jid,
        nomorHp: String(jid).split('@')[0],
        item,
        total,
        status: 'menunggu',
        waktu: new Date().toISOString(),
    };
    arr.push(rec);
    tulis(arr);
    return rec;
}

// Daftar pesanan yang masih menunggu
function yangMenunggu() {
    return baca().filter(p => p.status === 'menunggu');
}

// Ubah status berdasarkan nomor (mis. NAY-0003 → dikonfirmasi)
function ubahStatus(nomor, status) {
    const arr = baca();
    const p = arr.find(x => String(x.nomor).toLowerCase() === String(nomor).toLowerCase());
    if (!p) return null;
    p.status = status;
    p.waktuUpdate = new Date().toISOString();
    tulis(arr);
    return p;
}

module.exports = { baca, tambah, yangMenunggu, ubahStatus, nomorBaru };