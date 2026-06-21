require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaNeon } = require("@prisma/adapter-neon");

const prisma = new PrismaClient({ 
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }) 
});

async function checkAll() {
  console.log("=== DATABASE CHECK ===\n");

  // Check Suppliers
  const suppliers = await prisma.supplier.findMany({ orderBy: { name: 'asc' } });
  console.log(`SUPPLIERS (${suppliers.length}):`);
  suppliers.forEach(s => console.log(`  - ${s.name}`));

  // Check Products
  const products = await prisma.product.findMany({ 
    include: { supplier: true },
    orderBy: { category: 'asc' }
  });
  console.log(`\nPRODUCTS (${products.length}):`);
  
  // Group by category
  const byCategory = {};
  products.forEach(p => {
    const cat = p.category || 'Uncategorized';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(p);
  });
  
  Object.keys(byCategory).sort().forEach(cat => {
    console.log(`\n  ${cat} (${byCategory[cat].length}):`);
    byCategory[cat].forEach(p => {
      console.log(`    - ${p.name} (${p.supplier.name})`);
    });
  });

  // Check Stock Entries
  const stockEntries = await prisma.stockEntry.count();
  console.log(`\n\nSTOCK ENTRIES: ${stockEntries}`);

  // Check Sales
  const sales = await prisma.sale.count();
  const saleItems = await prisma.saleItem.count();
  console.log(`SALES: ${sales}`);
  console.log(`SALE ITEMS: ${saleItems}`);

  await prisma.$disconnect();
}

checkAll().catch(console.error);
