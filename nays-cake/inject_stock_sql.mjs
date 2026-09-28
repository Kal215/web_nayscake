import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: "postgresql://neondb_owner:npg_jLgvqwWc1B2C@ep-patient-glitter-aow8evch-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
});

async function main() {
  await client.connect();
  console.log("Berhasil masuk ke brankas NeonDB!");

  // Ambil 5 produk acak/pertama
  const res = await client.query('SELECT id, name FROM "Product" ORDER BY name ASC LIMIT 5;');
  
  if (res.rows.length === 0) {
    console.log("Database kosong!");
    return;
  }

  for (let row of res.rows) {
    // 1. Suntikkan StockEntry
    await client.query(`
      INSERT INTO "StockEntry" ("id", "productId", "quantityIn", "quantityReturned", "quantityDamaged", "date", "notes")
      VALUES (gen_random_uuid()::text, $1, 50, 0, 0, NOW(), 'Suntikan Super AI')
    `, [row.id]);
    
    // 2. Aktifkan Produk (isActive = true)
    await client.query(`
      UPDATE "Product" SET "isActive" = true WHERE "id" = $1
    `, [row.id]);

    console.log(`- 📦 Stok masuk: ${row.name}`);
  }
  
  console.log("SEMUA STOK BERHASIL DIINJEKSI!");
  await client.end();
}

main().catch(err => {
  console.error("Gagal menembus database:", err);
  client.end();
});
