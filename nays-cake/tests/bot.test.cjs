const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const botRoot = path.resolve(__dirname, '../../Bot_Nay');
function load(name, directory, axios, fsOverride = fs) {
  const module = { exports: {} };
  const env = { WEB_BASE_URL: 'http://test.invalid', BOT_API_KEY: 'test-only-key' };
  vm.runInNewContext(fs.readFileSync(path.join(botRoot, name), 'utf8'), { module, exports: module.exports, __dirname: directory, process: { env }, console: { log() {}, warn() {}, error() {} }, setInterval, clearInterval, require: n => n === 'axios' ? axios : n === 'fs' ? fsOverride : require(n) });
  return module.exports;
}
function temp(t) { const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nays-test-')); t.after(() => fs.rmSync(dir, { recursive: true, force: true })); return dir; }

test('greeting does not swallow order; event quantity becomes recommendation', t => {
  const dir = temp(t);
  fs.writeFileSync(path.join(dir, 'produk.json'), JSON.stringify([{ id: 'p', nama: 'Risol Ayam', harga: 2000, pemasok: 'A' }]));
  const toko = load('toko.js', dir, {}); toko.muatProduk();
  assert.equal(toko.deteksiMaksud('kak mau pesan 10 risol'), 'pesan');
  assert.equal(toko.deteksiMaksud('mau 50 pcs buat arisan'), 'rekomendasi');
  assert.equal(toko.deteksiMaksud('mau 50 pcs risol ayam'), 'pesan');
  assert.equal(toko.deteksiMaksud('halo kak'), 'sapaan');
  assert.equal(toko.parsePesanan('risol ayam 10').items[0].subtotal, 20000);
});

test('outbox persists before request and replays same identity after restart', async t => {
  const dir = temp(t), keys = [];
  let online = false;
  const axios = { post: async (url, body) => {
    assert.equal(fs.existsSync(path.join(dir, 'pesanan.json')), true);
    keys.push(body.requestKey);
    if (!online) throw new Error('timeout after commit');
    return { status: 201, data: { order: { id: 'web', orderNumber: 'NAY-TEST', totalAmount: 4000 } } };
  } };
  let db = load('pesanan.js', dir, axios);
  const options = { requestKey: crypto.randomUUID(), pickupAt: '2027-01-01T09:00:00+07:00' };
  const items = [{ id: 'p', nama: 'Risol', jumlah: 2, harga: 2000 }];
  assert.equal((await db.tambah('628123456789@s.whatsapp.net', items, options)).sumber, 'LOKAL');
  online = true; db = load('pesanan.js', dir, axios);
  assert.equal((await db.tambah('628123456789@s.whatsapp.net', items, options)).sumber, 'WEB');
  assert.equal(keys.length, 2); assert.equal(keys[0], keys[1]); assert.equal(db.baca().length, 1);
});

test('disk write failure cannot return a successful order', async t => {
  const dir = temp(t);
  const db = load('pesanan.js', dir, { post: () => assert.fail('network must not run') }, { ...fs, openSync: () => { throw new Error('disk full'); } });
  await assert.rejects(() => db.tambah('628123456789@s.whatsapp.net', [{ id: 'p', jumlah: 1, harga: 1000 }]), /disk full/);
});

test('validation rejection stops automatic retries and is surfaced to caller', async t => {
  const dir = temp(t); let calls = 0;
  const db = load('pesanan.js', dir, { post: async () => { calls++; const e = new Error('conflict'); e.response = { status: 409, data: { error: 'Harga berubah' } }; throw e; } });
  await assert.rejects(() => db.tambah('628123456789@s.whatsapp.net', [{ id: 'p', jumlah: 1, harga: 1000 }]), /Harga berubah/);
  await db.sinkronkan(); assert.equal(calls, 1); assert.equal(db.ringkasanSinkron().failed, 1);
});

test('corrupt outbox is not silently replaced', async t => {
  const dir = temp(t); fs.writeFileSync(path.join(dir, 'pesanan.json'), '{broken');
  const db = load('pesanan.js', dir, {});
  await assert.rejects(() => db.tambah('628123456789@s.whatsapp.net', []));
  assert.equal(fs.readFileSync(path.join(dir, 'pesanan.json'), 'utf8'), '{broken');
});

test('cancelling an ambiguous timeout cancels the remote order after replay', async t => {
  const dir = temp(t); let online = false; let cancelled = false;
  const db = load('pesanan.js', dir, {
    post: async () => { if (!online) throw new Error('timeout'); return { status: 201, data: { order: { id: 'remote', orderNumber: 'NAY-REMOTE', totalAmount: 1000 } } }; },
    patch: async (url, body) => { assert.ok(url.endsWith('/remote')); assert.equal(body.status, 'DIBATALKAN'); cancelled = true; return {}; },
  });
  const order = await db.tambah('628123456789@s.whatsapp.net', [{ id: 'p', jumlah: 1, harga: 1000 }]);
  await assert.rejects(() => db.ubahStatus(order.nomor, 'dibatalkan'), /menunggu sinkronisasi/);
  online = true;
  await db.ubahStatus(order.nomor, 'dibatalkan');
  assert.equal(cancelled, true); assert.equal(db.baca()[0].status, 'dibatalkan');
});
