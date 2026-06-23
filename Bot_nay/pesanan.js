// =================================================================
//  pesanan.js — Pencatatan pesanan pelanggan
//  Status: kirim ke website / fallback ke pesanan.json
// =================================================================
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const FILE = path.join(__dirname, 'pesanan.json');

const WEB_BASE_URL = process.env.WEB_BASE_URL || 'https://nayscake.vercel.app';
const BOT_API_KEY = process.env.BOT_API_KEY || '';

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

// ---- Kirim ke website API (async) ----
// opsi: { orderType, pickupAt, pickupRaw, pickupLocation }
async function kirimKeWebsite(jid, item, customerPhone, opsi = {}) {
    try {
        const body = {
            customerPhone: customerPhone || null,
            customerName: null,
            notes: opsi.pickupRaw ? `Ambil: ${opsi.pickupRaw}` : null,
            items: item.map(i => ({
                productId: i.id,
                quantity: i.jumlah,
            })),
        };
        // Tambah field pickup jika ada
        if (opsi.orderType) body.orderType = opsi.orderType;
        if (opsi.pickupAt) body.pickupAt = opsi.pickupAt;
        if (opsi.pickupRaw) body.pickupRaw = opsi.pickupRaw;
        if (opsi.pickupLocation) body.pickupLocation = opsi.pickupLocation;

        const response = await axios.post(`${WEB_BASE_URL}/api/orders`, body, {
            headers: {
                'x-api-key': BOT_API_KEY,
                'Content-Type': 'application/json',
            },
            timeout: 10000,
        });

        if (response.status === 201 && response.data?.order) {
            console.log(`[PESANAN] Terkirim ke website: ${response.data.order.orderNumber}`);
            return {
                sukses: true,
                nomor: response.data.order.orderNumber,
                total: Number(response.data.order.totalAmount),
                sumber: 'WEB',
            };
        }

        throw new Error(`Respons tidak valid: ${response.status}`);
    } catch (e) {
        console.warn(`[PESANAN] Gagal kirim ke website (${e.message}) → fallback lokal`);
        return { sukses: false, error: e.message };
    }
}

// ---- Tambah pesanan baru (async) ----
// `jid` = nomor WA pelanggan
// `item` = array {id, nama, jumlah, harga, subtotal, pemasok}
// `opsi` = { orderType, pickupAt, pickupRaw, pickupLocation } (opsional)
// Kembalikan { nomor, total, sumber }
async function tambah(jid, item, opsi = {}) {
    // Ekstrak nomor HP dari JID
    const customerPhone = String(jid).split('@')[0].replace(/[^\d]/g, '');

    // Coba kirim ke website dulu
    const hasil = await kirimKeWebsite(jid, item, customerPhone, opsi);
    
    if (hasil.sukses) {
        return {
            nomor: hasil.nomor,
            total: hasil.total,
            sumber: 'WEB',
            fromWebsite: true,
        };
    }

    // Fallback: simpan ke pesanan.json lokal
    console.log(`[PESANAN] Fallback ke lokal: ${customerPhone}`);
    const arr = baca();
    const rec = {
        nomor: nomorBaru(arr),
        jid,
        nomorHp: customerPhone,
        item,
        total: item.reduce((s, i) => s + (i.subtotal || 0), 0),
        status: 'menunggu',
        waktu: new Date().toISOString(),
        dariWebsite: false,
        // Simpan pickup info di lokal juga
        orderType: opsi.orderType || null,
        pickupAt: opsi.pickupAt || null,
        pickupRaw: opsi.pickupRaw || null,
        pickupLocation: opsi.pickupLocation || null,
    };
    arr.push(rec);
    tulis(arr);
    
    return {
        nomor: rec.nomor,
        total: rec.total,
        sumber: 'LOKAL',
        fromWebsite: false,
    };
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
