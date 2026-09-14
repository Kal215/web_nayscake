const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const root = path.resolve(__dirname, '../../Bot_Nay');
const localRequire = createRequire(path.join(root, 'ai.js'));
const accuracy = localRequire('./akurasi');
const knowledge = localRequire('./pengetahuan');

test('knowledge loader excludes unapproved entries and fails closed on broken files', () => {
    function fixture(data) {
        const module = { exports: {} };
        vm.runInNewContext(fs.readFileSync(path.join(root, 'pengetahuan.js'), 'utf8'), {
            module, exports: module.exports, __dirname: root, process: { env: {} },
            require: name => name === 'fs' ? { readFileSync: () => data } : localRequire(name),
        });
        return module.exports.faktaDisetujui();
    }
    assert.equal(fixture('broken').length, 0);
    assert.equal(fixture(JSON.stringify({ version: 2, facts: [] })).length, 0);
    const facts = fixture(JSON.stringify({ version: 1, facts: [
        { id: 'yes', topic: 'jam', text: 'Resmi', approved: true },
        { id: 'no', topic: 'bahan', text: 'Belum resmi', approved: false },
        { id: 'yes', topic: 'duplikat', text: 'Lain', approved: true },
    ] }));
    assert.equal(facts.length, 1);
    assert.equal(facts[0].text, 'Resmi');
});

function mockAI(replies = []) {
    const calls = [];
    const module = { exports: {} };
    vm.runInNewContext(fs.readFileSync(path.join(root, 'ai.js'), 'utf8'), {
        module, exports: module.exports,
        require: name => name === 'axios' ? { post: async (url, body) => {
            calls.push({ url, body });
            const content = replies.shift();
            if (content instanceof Error) throw content;
            return { data: { choices: [{ message: { content: content || 'invalid' } }] } };
        } } : localRequire(name),
        process: { env: { SAMBANOVA_API_KEY: 'test', GROQ_API_KEY: 'test', GROQ_API_KEY_2: 'test', OPENROUTER_API_KEY: 'test' } },
        console: { warn() {} }, Date, Intl,
    }, { filename: 'ai.js' });
    return { ai: module.exports, calls };
}

test('approved branch facts include the owner-confirmed Maps URL', () => {
    const facts = knowledge.faktaDisetujui();
    assert.equal(facts.length, 5);
    assert.match(facts.find(f => f.id === 'maps_cabang').text, /fzvJrdbCGMVV3yFq7/);
    assert.throws(() => knowledge.susunJawaban('{"kind":"facts","factIds":["invented"]}', facts));
    assert.throws(() => knowledge.susunJawaban('{"kind":"facts","factIds":["jam_utama","jam_utama"]}', facts));
});

test('knowledge output ignores invented prose and renders only official text', async () => {
    const { ai } = mockAI(['{"kind":"facts","factIds":["jam_utama"],"content":"Buka 24 jam, gratis semua"}']);
    const reply = await ai.jawabTerverifikasi([], 'Jam buka utama?');
    assert.match(reply.content, /06.00-18.00/);
    assert.doesNotMatch(reply.content, /24 jam|gratis/);
});

test('invalid fact references retry then fail closed after three providers', async () => {
    const { ai, calls } = mockAI(Array(4).fill('{"kind":"facts","factIds":["made-up"]}'));
    const reply = await ai.jawabTerverifikasi([], 'Apa saja layanan toko?');
    assert.equal(reply.handoff, true);
    assert.equal(reply.content, knowledge.HANDOFF);
    assert.equal(calls.length, 3);
});

test('sensitive claims never reach an AI provider', async () => {
    const { ai, calls } = mockAI();
    for (const question of ['Bahan apa?', 'Aman untuk alergi?', 'Tahan tiga hari?', 'Sudah halal?', 'Cara simpan?']) {
        assert.equal((await ai.jawabTerverifikasi([], question)).handoff, true);
    }
    assert.equal(calls.length, 0);
});

test('recommendations validate IDs and render prices from the complete catalogue', async () => {
    const products = Array.from({ length: 30 }, (_, i) => ({ id: 'p' + i, nama: 'Produk ' + i, harga: 2000 + i }));
    const { ai, calls } = mockAI(['{"ids":["unknown"]}', '{"ids":["p29"],"harga":1,"text":"Tahan 7 hari"}']);
    const reply = await ai.rekomendasiProduk(products, 'manis', 'untuk acara');
    assert.match(reply, /Produk 29/);
    assert.match(reply, /2.029/);
    assert.doesNotMatch(reply, /Tahan 7 hari/);
    assert.equal(calls.length, 2);
});

test('invalid recommendations fall back to actual catalogue products', async () => {
    const { ai } = mockAI(['not json', '{"ids":[]}', '{"ids":["p1","p1"]}']);
    const reply = await ai.rekomendasiProduk([{ id: 'p1', nama: 'Risol', harga: 2500 }], 'gurih', '');
    assert.match(reply, /Risol.*2.500/);
    assert.match(reply, /perlu dikonfirmasi admin/);
    assert.throws(() => accuracy.pilihProduk({ ids: ['p1', 'p1'] }, []));
});

test('dates use the Jakarta calendar and require explicit time', async () => {
    const { ai, calls } = mockAI();
    const now = new Date('2026-09-15T18:30:00Z'); // Already September 16 in Jakarta.
    const result = await ai.bacaTanggal('besok jam 09.00', now);
    assert.equal(result.iso, '2026-09-17T09:00+07:00');
    for (const text of ['besok', 'besok jam 9 malam', 'besok atau lusa jam 9', 'bukan besok jam 9', 'besok jam 09.001', 'besok jam 25', 'besok jam 9:70']) {
        assert.equal((await ai.bacaTanggal(text, now)).valid, false, text);
    }
    assert.equal(calls.length, 0);
});

test('explicit dates reject impossible calendar values and past times', async () => {
    const { ai } = mockAI();
    const now = new Date('2026-09-15T18:30:00Z');
    for (const text of ['20 September 2026 jam 09.00', '20/09/2026 pukul 09.00 WIB', '2026-09-20 jam 09']) {
        assert.equal((await ai.bacaTanggal(text, now)).iso, '2026-09-20T09:00+07:00');
    }
    for (const text of ['30 Februari 2027 jam 09', '31/09/2026 jam 09', 'hari ini jam 00.30']) {
        assert.equal((await ai.bacaTanggal(text, now)).valid, false, text);
    }
    assert.throws(() => accuracy.validasiTanggal({ valid: true, iso: '2026-09-20T09:00Z' }, now));
});

test('bot routes free-form answers through fact validation and never bypasses invalid dates', () => {
    const source = fs.readFileSync(path.join(root, 'bot-nays-cake.js'), 'utf8');
    assert.match(source, /return ai\.jawabTerverifikasi\(riwayat, pesanBaru\)/);
    assert.doesNotMatch(source, /gagalTanggal >= 2|produkFilter\.slice\(0, 20\)|TmSnd8S9biQJzntu9/);
    assert.match(source, /fzvJrdbCGMVV3yFq7/);
});
