const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { Prisma } = require('@prisma/client');
const root = path.resolve(__dirname, '..');

function loader(overrides = {}) {
  const cache = new Map();
  function load(file) {
    const full = path.join(root, file);
    if (cache.has(full)) return cache.get(full).exports;
    const module = { exports: {} }; cache.set(full, module);
    const code = ts.transpileModule(fs.readFileSync(full, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const localRequire = id => {
      if (id in overrides) return overrides[id];
      if (id === 'next/server') return { NextResponse: { json: (value, init) => Response.json(value, init) } };
      if (id.startsWith('@/')) return load('src/' + id.slice(2) + '.ts');
      return require(id);
    };
    vm.runInNewContext(code, { module, exports: module.exports, require: localRequire, process, console, Request, Response, URL, Date, crypto: require('node:crypto').webcrypto });
    return module.exports;
  }
  return load;
}

test('all administrative routes reject anonymous requests before accessing data', async () => {
  const load = loader({ '@/lib/auth': { auth: async () => null }, '@/lib/prisma': { prisma: {} } });
  const cases = [
    ['orders', 'GET'], ['orders/count', 'GET'], ['orders/[id]', 'GET'], ['orders/[id]', 'PATCH'], ['sales', 'GET'], ['sales', 'POST'],
    ['stock', 'GET'], ['stock', 'POST'], ['stock', 'PATCH'], ['reset', 'POST'], ['reset', 'GET'],
    ['products', 'POST'], ['products/[id]', 'PUT'], ['products/[id]', 'DELETE'],
    ['suppliers', 'GET'], ['suppliers', 'POST'], ['reports', 'GET'], ['dashboard', 'GET'], ['bot/health', 'GET'],
  ];
  for (const [route, method] of cases) {
    const response = await load('src/app/api/' + route + '/route.ts')[method](new Request('http://localhost/api/' + route, { method }), { params: Promise.resolve({ id: 'x' }) });
    assert.equal(response.status, 401, route + ':' + method);
  }
  const internal = await load('src/app/api/products/route.ts').GET(new Request('http://localhost/api/products?internal=1'));
  assert.equal(internal.status, 401);
});

test('ordinary admin cannot reset stock or archive products', async () => {
  const load = loader({ '@/lib/auth': { auth: async () => ({ user: { id: 'a' } }) }, '@/lib/prisma': { prisma: { user: { findUnique: async () => ({ id: 'a', role: 'ADMIN' }) } } } });
  assert.equal((await load('src/app/api/reset/route.ts').POST()).status, 403);
  assert.equal((await load('src/app/api/products/[id]/route.ts').DELETE(new Request('http://localhost'), { params: Promise.resolve({ id: 'p' }) })).status, 403);
});

test('Jakarta boundaries do not depend on server timezone', () => {
  const load = loader({ '@/lib/prisma': { prisma: {} } });
  const { dayRange, jakartaDate } = load('src/lib/business.ts');
  assert.equal(jakartaDate(new Date('2026-09-13T18:00:00Z')), '2026-09-14');
  assert.equal(dayRange('2026-09-14').gte.toISOString(), '2026-09-13T17:00:00.000Z');
  assert.equal(dayRange('2026-09-14').lt.toISOString(), '2026-09-14T17:00:00.000Z');
});

test('report reconciles cashier sales inside closed daily stock and preserves actual prices', async () => {
  const product = { name: 'Risol', sellingPrice: 3000, costPrice: 1800, supplier: { name: 'Supplier' } };
  const db = {
    stockEntry: { findMany: async () => [{ productId: 'p', date: new Date('2026-09-14T01:00:00Z'), quantityIn: 100, quantityRemaining: 15, quantityReturned: 3, quantityDamaged: 2, price: 2000, cost: 1000, product }] },
    saleItem: { findMany: async () => [{ productId: 'p', product, supplier: product.supplier, sale: { saleDate: new Date('2026-09-14T01:00:00Z') }, quantity: 20, subtotal: 38000, cost: 1000 }] },
  };
  const data = await loader({ '@/lib/prisma': { prisma: db } })('src/lib/reporting.ts').report(new Date(), new Date());
  assert.equal(data.totals.sold, 80);
  assert.equal(data.totals.revenue, 158000);
  assert.equal(data.totals.cost, 80000);
  assert.equal(data.rows[0].inferred, 60);
});

test('unclosed stock does not fabricate sales', async () => {
  const db = { stockEntry: { findMany: async () => [{ productId: 'p', date: new Date(), quantityRemaining: null, product: { name: 'Cake', supplier: { name: 'S' } } }] }, saleItem: { findMany: async () => [] } };
  const result = await loader({ '@/lib/prisma': { prisma: db } })('src/lib/reporting.ts').report(new Date(), new Date());
  assert.equal(result.totals.revenue, 0); assert.equal(result.pending, 1);
});

test('inventory uses closed remaining or current-day incoming minus recorded sales', async () => {
  const db = { stockEntry: { findMany: async () => [{ productId: 'a', quantityIn: 100, quantityRemaining: 20, quantityReturned: 0, quantityDamaged: 0 }, { productId: 'b', quantityIn: 50, quantityRemaining: null, quantityReturned: 0, quantityDamaged: 0 }] }, saleItem: { groupBy: async () => [{ productId: 'a', _sum: { quantity: 30 } }, { productId: 'b', _sum: { quantity: 12 } }] } };
  const result = await loader({ '@/lib/prisma': { prisma: db } })('src/lib/inventory.ts').inventory();
  assert.equal(result.get('a'), 20); assert.equal(result.get('b'), 38);
});

test('partially closed multi-entry inventory does not double-count cashier sales', async () => {
  const db = { stockEntry: { findMany: async () => [
    { productId: 'p', quantityIn: 100, quantityRemaining: 20, quantityReturned: 5, quantityDamaged: 5 },
    { productId: 'p', quantityIn: 50, quantityRemaining: null, quantityReturned: 0, quantityDamaged: 0 },
  ] }, saleItem: { groupBy: async () => [{ productId: 'p', _sum: { quantity: 90 } }] } };
  const result = await loader({ '@/lib/prisma': { prisma: db } })('src/lib/inventory.ts').inventory();
  assert.equal(result.get('p'), 50);
});

test('cashier ignores client price and cost and uses database values', async () => {
  let data;
  const tx = {
    sale: { findUnique: async () => null, create: async args => { data = args.data; return { id: 'sale' }; } },
    product: { findMany: async () => [{ id: 'p', supplierId: 's', sellingPrice: new Prisma.Decimal(2000), costPrice: new Prisma.Decimal(1200) }] },
    stockEntry: { findMany: async () => [{ quantityIn: 10, quantityRemaining: null }] }, saleItem: { aggregate: async () => ({ _sum: { quantity: 2 } }) }, auditLog: { create: async () => ({}) },
  };
  const load = loader({ '@/lib/prisma': { prisma: {} }, '@/lib/auth': {} });
  await load('src/lib/sales.ts').recordSale(tx, { requestKey: 'sale-key', items: [{ productId: 'p', quantity: 3, price: 1, cost: 0 }] }, 'admin');
  assert.equal(Number(data.totalAmount), 6000); assert.equal(Number(data.totalProfit), 2400);
  await assert.rejects(() => load('src/lib/sales.ts').recordSale(tx, { requestKey: 'another', items: [{ productId: 'p', quantity: 9 }] }, 'admin'), /Stok tidak cukup/);
});

test('replayed sale returns existing result without touching stock', async () => {
  const load = loader({ '@/lib/prisma': { prisma: {} }, '@/lib/auth': {} });
  const existing = { id: 'sale' };
  const result = await load('src/lib/sales.ts').recordSale({ sale: { findUnique: async () => existing } }, { requestKey: 'same', items: [] }, 'admin');
  assert.equal(result, existing);
});

test('strict order validation rejects fractional quantity and unbounded input', () => {
  const schema = loader()('src/lib/validation.ts').orderInput;
  const base = { requestKey: crypto.randomUUID(), items: [{ productId: 'p', quantity: 1 }] };
  assert.equal(schema.safeParse(base).success, true);
  assert.equal(schema.safeParse({ ...base, items: [{ productId: 'p', quantity: 1.5 }] }).success, false);
  assert.equal(schema.safeParse({ ...base, items: [{ productId: 'p', quantity: '10junk' }] }).success, false);
});
