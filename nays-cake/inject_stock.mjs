process.env.DATABASE_URL = "postgresql://neondb_owner:npg_jLgvqwWc1B2C@ep-patient-glitter-aow8evch-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("Terhubung ke NeonDB...");
  const products = await prisma.product.findMany({ take: 5, orderBy: { name: 'asc' } });
  
  if (products.length === 0) {
    console.log("Tidak ada produk di database.");
    return;
  }

  const stockData = products.map((p) => ({
    productId: p.id,
    quantityIn: 50,
    notes: "Suntikan Uji Coba (AI)"
  }));
  
  await prisma.stockEntry.createMany({ data: stockData });

  const ids = products.map((p) => p.id);
  await prisma.product.updateMany({
    where: { id: { in: ids } },
    data: { isActive: true }
  });

  console.log("Berhasil menyuntikkan stok ke:");
  products.forEach(p => console.log("- " + p.name));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
