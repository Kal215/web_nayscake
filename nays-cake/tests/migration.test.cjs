const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { PGlite } = require('@electric-sql/pglite');

test('all migrations preserve legacy rows and enforce order replay uniqueness', async () => {
  const db = new PGlite();
  try {
    const root = path.resolve(__dirname, '../prisma/migrations');
    const migrations = fs.readdirSync(root).filter(n => fs.statSync(path.join(root, n)).isDirectory()).sort();
    for (const name of migrations.slice(0, -1)) await db.exec(fs.readFileSync(path.join(root, name, 'migration.sql'), 'utf8'));
    await db.exec(`
      INSERT INTO suppliers (id, name, "updatedAt") VALUES ('s', 'Supplier Uji', NOW());
      INSERT INTO products (id, "supplierId", name, slug, "costPrice", "sellingPrice", "updatedAt") VALUES ('p', 's', 'Risol', 'risol', 1000, 2000, NOW());
      INSERT INTO stock_entries (id, "productId", "quantityIn", "quantityRemaining") VALUES ('stock', 'p', 100, 20);
      INSERT INTO orders (id, "orderNumber", "totalAmount", "updatedAt") VALUES ('old', 'NAY-0001', 4000, NOW());
      INSERT INTO order_items (id, "orderId", "productId", "productName", quantity, price, subtotal) VALUES ('item', 'old', 'p', 'Risol', 2, 2000, 4000);
    `);
    await db.exec(fs.readFileSync(path.join(root, migrations.at(-1), 'migration.sql'), 'utf8'));
    assert.equal((await db.query('SELECT COUNT(*)::int AS n FROM orders')).rows[0].n, 1);
    const stock = (await db.query('SELECT * FROM stock_entries')).rows[0];
    assert.equal(Number(stock.price), 2000); assert.equal(Number(stock.cost), 1000);
    assert.equal(stock.quantityRemaining, 20);
    assert.equal(Number((await db.query('SELECT cost FROM order_items')).rows[0].cost), 1000);
    await db.exec(`INSERT INTO orders (id, "orderNumber", "requestKey", "totalAmount", "updatedAt") VALUES ('new', 'NAY-NEW', 'request-1', 4000, NOW())`);
    await assert.rejects(() => db.exec(`INSERT INTO orders (id, "orderNumber", "requestKey", "totalAmount", "updatedAt") VALUES ('duplicate', 'NAY-DUP', 'request-1', 4000, NOW())`), /unique/);
    await db.exec(`UPDATE products SET "sellingPrice" = 3000 WHERE id = 'p'`);
    assert.equal(Number((await db.query('SELECT price FROM stock_entries')).rows[0].price), 2000);
  } finally { await db.close(); }
});
