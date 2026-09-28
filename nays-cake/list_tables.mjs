import pg from 'pg';
const client = new pg.Client("postgresql://neondb_owner:npg_jLgvqwWc1B2C@ep-patient-glitter-aow8evch-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require");
async function main() {
  await client.connect();
  const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public';");
  console.log(res.rows);
  await client.end();
}
main();
