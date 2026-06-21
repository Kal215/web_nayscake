require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaNeon } = require("@prisma/adapter-neon");

const prisma = new PrismaClient({ 
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }) 
});

async function check() {
  const products = await prisma.product.findMany({ 
    where: { name: { contains: 'Putu' } }, 
    include: { supplier: true } 
  });
  
  console.log("Products with 'Putu':");
  products.forEach(p => {
    console.log(`- ${p.name} | Category: ${p.category} | Supplier: ${p.supplier.name}`);
  });
  
  await prisma.$disconnect();
}

check();
