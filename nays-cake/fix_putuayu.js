require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaNeon } = require("@prisma/adapter-neon");

const prisma = new PrismaClient({ 
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }) 
});

async function fix() {
  // Find and delete the wrong Putu Ayu from IBU ERNI (category should not exist)
  const wrongProducts = await prisma.product.findMany({ 
    where: { 
      name: "Putu Ayu",
      category: "Putu Ayu" // This is wrong category
    } 
  });
  
  console.log("Found wrong products:", wrongProducts.length);
  
  for (const product of wrongProducts) {
    await prisma.product.delete({ where: { id: product.id } });
    console.log(`Deleted: ${product.name} (ID: ${product.id})`);
  }
  
  // Check remaining Putu Ayu products
  const remaining = await prisma.product.findMany({ 
    where: { name: { contains: 'Putu' } }, 
    include: { supplier: true } 
  });
  
  console.log("\nRemaining products with 'Putu':");
  remaining.forEach(p => {
    console.log(`- ${p.name} | Category: ${p.category} | Supplier: ${p.supplier.name}`);
  });
  
  await prisma.$disconnect();
}

fix();
