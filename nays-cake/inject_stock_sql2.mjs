import pg from 'pg';
const client = new pg.Client("postgresql://neondb_owner:npg_jLgvqwWc1B2C@ep-patient-glitter-aow8evch-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require");

async function main() {
  await client.connect();

  // Lihat nama kolom asli untuk memastikan
  // const cols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'products';");
  // console.log("Kolom products:", cols.rows.map(r => r.column_name));

  const res = await client.query('SELECT id, name FROM products ORDER BY name ASC LIMIT 5;');
  
  for (let row of res.rows) {
    // Inject stock_entries
    // Prisma generate id (cuid). Kita pakai cuid palsu atau uuid
    await client.query(`
      INSERT INTO stock_entries ("id", "productId", "quantityIn", "quantityReturned", "quantityDamaged", "date", "notes")
      VALUES (gen_random_uuid()::text, $1, 50, 0, 0, NOW(), 'Suntikan Super AI')
    `, [row.id]);
    
    // Aktifkan Produk (isActive -> is_active atau isActive tergantung schema.prisma)
    // Kita asumsikan isActive, jika gagal berarti is_active
    try {
      await client.query(`UPDATE products SET "isActive" = true WHERE id = $1`, [row.id]);
    } catch(e) {
      await client.query(`UPDATE products SET is_active = true WHERE id = $1`, [row.id]);
    }

    console.log(`- 📦 Stok 50 buah ditambahkan ke: ${row.name}`);
  }
  
  await client.end();
}

main().catch(err => {
  console.error(err);
  client.end();
});
