// =================================================================
//  ai.js — Lapisan AI multi-penyedia dengan FALLBACK berantai.
//  Urutan coba: Gemini → Groq → OpenRouter.
//  Kalau satu kena limit/error, otomatis lanjut ke berikutnya.
//  Bot hampir tidak pernah "mati" gara-gara kuota satu penyedia.
//
//  Semua kunci & model diatur lewat .env (lihat .env.contoh).
//  Penyedia yang API key-nya kosong otomatis DILEWATI.
// =================================================================
const axios = require('axios');

// Baca konfigurasi SETIAP dipanggil (bukan sekali saat import).
// Ini membuat ai.js kebal terhadap urut-urutan pemuatan .env.
function cfg() {
    return {
        timeout: parseInt(process.env.AI_TIMEOUT_MS || '60000', 10),
        temperature: parseFloat(process.env.AI_TEMPERATURE || '0.6'),
        maxTokens: parseInt(process.env.AI_MAX_TOKENS || '800', 10),

        gemini: {
            key: process.env.GEMINI_API_KEY || '',
            model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        },
        groq: {
            key: process.env.GROQ_API_KEY || '',
            model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
            url: 'https://api.groq.com/openai/v1/chat/completions',
        },
        openrouter: {
            key: process.env.OPENROUTER_API_KEY || '',
            model: process.env.OPENROUTER_MODEL || 'openai/gpt-oss-120b:free',
            url: 'https://openrouter.ai/api/v1/chat/completions',
        },
    };
}

// Apakah error ini layak "lanjut ke penyedia berikutnya"?
// (limit/kuota/rate/5xx/timeout = ya. Selain itu tetap lanjut juga,
//  karena tujuan kita: bot tetap menjawab semaksimal mungkin.)
function layakFallback(err) {
    const status = err.response?.status;
    if (status === 429) return true;                 // rate limit
    if (status >= 500 && status <= 599) return true; // server error
    if (/quota|rate limit|exceeded|timeout|ECONNABORTED|overloaded/i.test(err.message || '')) return true;
    return true; // default: tetap coba penyedia lain
}

// ---- Format umum: ubah riwayat ke bentuk "messages" gaya OpenAI ----
function keMessages(systemPrompt, riwayat, pesanBaru) {
    const msgs = [{ role: 'system', content: systemPrompt }];
    for (const m of riwayat) {
        msgs.push({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content) });
    }
    msgs.push({ role: 'user', content: pesanBaru });
    return msgs;
}

// =================================================================
// PENYEDIA 1: GEMINI  (format Google, beda sendiri)
// =================================================================
async function panggilGemini(systemPrompt, riwayat, pesanBaru) {
    const C = cfg();
    const g = C.gemini;
    if (!g.key) throw new Error('SKIP: GEMINI_API_KEY kosong');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${g.model}:generateContent`;
    const contents = [];
    for (const m of riwayat) {
        contents.push({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: String(m.content) }] });
    }
    contents.push({ role: 'user', parts: [{ text: pesanBaru }] });
    const body = {
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { temperature: C.temperature, maxOutputTokens: C.maxTokens },
    };
    const res = await axios.post(url, body, {
        timeout: C.timeout,
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': g.key },
    });
    const cand = res.data.candidates && res.data.candidates[0];
    const teks = cand?.content?.parts?.map(p => p.text || '').join('').trim() || '';
    if (!teks) throw new Error('Gemini balas kosong');
    return teks;
}

// =================================================================
// PENYEDIA 2 & 3: GROQ & OPENROUTER  (sama-sama OpenAI-compatible)
// =================================================================
async function panggilOpenAICompat(prov, label, systemPrompt, riwayat, pesanBaru, extraHeaders = {}) {
    const C = cfg();
    if (!prov.key) throw new Error(`SKIP: ${label} API key kosong`);
    const body = {
        model: prov.model,
        messages: keMessages(systemPrompt, riwayat, pesanBaru),
        temperature: C.temperature,
        max_tokens: C.maxTokens,
    };
    const res = await axios.post(prov.url, body, {
        timeout: C.timeout,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${prov.key}`, ...extraHeaders },
    });
    const teks = res.data.choices?.[0]?.message?.content?.trim() || '';
    if (!teks) throw new Error(`${label} balas kosong`);
    return teks;
}
async function panggilGroq(s, r, p) {
    return panggilOpenAICompat(cfg().groq, 'Groq', s, r, p);
}
async function panggilOpenRouter(s, r, p) {
    return panggilOpenAICompat(cfg().openrouter, 'OpenRouter', s, r, p, {
        'HTTP-Referer': 'https://nayscake.local',  // disarankan OpenRouter
        'X-Title': "Nay's Cake Bot",
    });
}

// =================================================================
// FUNGSI UTAMA: coba berurutan sampai ada yang berhasil
// =================================================================
const URUTAN = [
    { nama: 'Gemini', fn: panggilGemini, aktif: () => !!cfg().gemini.key },
    { nama: 'Groq', fn: panggilGroq, aktif: () => !!cfg().groq.key },
    { nama: 'OpenRouter', fn: panggilOpenRouter, aktif: () => !!cfg().openrouter.key },
];

async function tanyaAI(systemPrompt, riwayat, pesanBaru) {
    const dicoba = [];
    let errTerakhir = null;

    for (const prov of URUTAN) {
        if (!prov.aktif()) continue;   // lewati yang tidak punya key
        try {
            const teks = await prov.fn(systemPrompt, riwayat, pesanBaru);
            return { content: teks, penyedia: prov.nama, dicoba };
        } catch (err) {
            const status = err.response?.status || '';
            const pesan = err.response?.data?.error?.message || err.message;
            dicoba.push(`${prov.nama}(${status || 'err'})`);
            errTerakhir = err;
            console.warn(`[AI] ${prov.nama} gagal: ${status} ${pesan}. Lanjut ke penyedia berikutnya...`);
            if (!layakFallback(err)) break;
            // lanjut ke penyedia berikutnya
        }
    }
    // semua penyedia gagal / tidak ada yang aktif
    const e = new Error('SEMUA_AI_GAGAL');
    e.detail = dicoba;
    e.penyebab = errTerakhir;
    throw e;
}

// Info penyedia yang aktif (untuk log saat startup)
function penyediaAktif() {
    return URUTAN.filter(p => p.aktif()).map(p => p.nama);
}

const PROMPT_BASA_BASI = `Kamu asisten toko kue "Nay's Cake". Pelanggan mengirim pesan yang mengandung basa-basi/candaan/sapaan. Balas HANYA basa-basinya dengan 1 kalimat pendek, ramah, natural. JANGAN sebut pesanan/harga/total/nama kue. JANGAN menulis "Pesanan dicatat" atau nomor pesanan. Maksimal 12 kata. Contoh output: "Hehe bisa aja Kak 😄" atau "Wah kangen juga nih, seneng denger kabarnya 😊"`;

// =================================================================
// HELPER: basa-basi singkat (1 kalimat, hemat token)
// Dipakai saat pesan pelanggan mengandung candaan/basa-basi + pesanan.
// Mengembalikan string pendek atau null jika gagal (caller lanjut kode).
// =================================================================
async function sapaBasa(pesanPelanggan) {
    try {
        const hasil = await tanyaAI(PROMPT_BASA_BASI, [], pesanPelanggan);
        const teks = (hasil.content || '').trim();
        // Tolak jika terlalu panjang atau mengandung kata terlarang
        if (!teks || teks.length > 150) return null;
        if (/pesanan|dicatat|NAY-|total|harga/i.test(teks)) return null;
        console.log(`[BASA-BASI:${hasil.penyedia}] "${teks}"`);
        return teks;
    } catch (e) {
        console.log(`[BASA-BASI] Gagal (${e.message}), lanjut kode`);
        return null; // gagal = lanjut tanpa basa-basi, tidak crash
    }
}

// =================================================================
// HELPER: baca tanggal dari teks (HANYA untuk ISI_TANGGAL)
// Mengembalikan { valid: boolean, iso: string|null, alasan: string }
// Format ISO: "YYYY-MM-DDTHH:mm"
// =================================================================
function buatPromptTanggal(hariIni) {
    return `Tanggal hari ini: ${hariIni}. Ubah teks tanggal pelanggan jadi JSON:
{"iso":"YYYY-MM-DDTHH:mm","valid":true/false,"alasan":"penjelasan jika tidak valid"}.
Format jam: HH:mm (24 jam). Jika jam tidak disebutkan, asumsikan jam 08:00.
PENTING: 
- "besok" = tanggal besok dari hari ini.
- "lusa" = 2 hari dari hari ini.
- "Jumat depan" = Jumat minggu depan.
- Jika teks merujuk ke masa lalu, valid=false, alasan="tanggal sudah lewat".
- Jika teks adalah HARI INI, tetap valid=true.
- Balas HANYA JSON, tanpa teks lain, tanpa markdown.
Teks:`;
}

async function bacaTanggal(teksTanggal) {
    try {
        const now = new Date();
        const hariIni = now.toISOString().slice(0, 10); // YYYY-MM-DD
        const prompt = buatPromptTanggal(hariIni);
        
        const hasil = await tanyaAI(prompt, [], teksTanggal);
        const jsonStr = (hasil.content || '').trim();
        
        // Parse JSON dari respons
        let data = null;
        try {
            data = JSON.parse(jsonStr);
        } catch {
            // Coba cari JSON dalam teks
            const match = jsonStr.match(/\{[\s\S]*\}/);
            if (match) {
                try { data = JSON.parse(match[0]); } catch {}
            }
        }
        
        if (!data || typeof data.valid !== 'boolean') {
            console.log(`[BACA_TANGGAL] Gagal parse JSON dari AI: ${jsonStr.slice(0, 100)}`);
            return { valid: false, iso: null, alasan: 'Gagal membaca tanggal, coba tulis ulang' };
        }
        
        console.log(`[BACA_TANGGAL:${hasil.penyedia}] "${teksTanggal}" → ${data.iso}, valid=${data.valid}`);
        return {
            valid: data.valid,
            iso: data.valid ? data.iso : null,
            alasan: data.alasan || ''
        };
    } catch (e) {
        console.log(`[BACA_TANGGAL] Error: ${e.message}`);
        return { valid: false, iso: null, alasan: 'Gagal membaca tanggal, coba tulis ulang' };
    }
}

module.exports = { tanyaAI, penyediaAktif, sapaBasa, bacaTanggal };
