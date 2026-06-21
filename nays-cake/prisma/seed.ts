import { PrismaClient, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create admin user
  const hashedPassword = await hash("admin123", 12);
  
  const admin = await prisma.user.upsert({
    where: { email: "admin@nayscake.com" },
    update: {},
    create: {
      name: "Admin Nay's Cake",
      email: "admin@nayscake.com",
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
    },
  });
  console.log("✅ Created admin user:", admin.email);

  // Create suppliers (based on analysis data)
  const suppliersData = [
    { name: "MAS ARIS" },
    { name: "MAS YANTO" },
    { name: "PAK ADE" },
    { name: "PAK SUGIMAN" },
    { name: "IBU DEDAH" },
    { name: "MAMAH DIKA" },
    { name: "PAK MASMUR" },
    { name: "PAK MUHIDIN" },
    { name: "IBU NUR" },
    { name: "PAK ROHMAT" },
    { name: "ADE BOY" },
    { name: "PAK USTAD" },
    { name: "MAS WARMAN" },
    { name: "IBU LINA" },
    { name: "MAS PARJO" },
    { name: "TEH DAWA" },
    { name: "IBU ERNI" },
    { name: "MBA RIA" },
    { name: "PAK KOKO" },
    { name: "BANG ZACK" },
    { name: "DESTA" },
    { name: "MAS PANJUL" },
    { name: "IBU IDDAH" },
    { name: "IBU SATE" },
    { name: "MAS BOKIR" },
    { name: "PAK TEMI" },
    { name: "MAS UDIN" },
    { name: "EMAK AREN" },
    { name: "IBU HETTI" },
  ];

  const suppliers: Record<string, string> = {};
  for (const supplierData of suppliersData) {
    const supplier = await prisma.supplier.upsert({
      where: { name: supplierData.name },
      update: {},
      create: supplierData,
    });
    suppliers[supplier.name] = supplier.id;
  }
  console.log(`✅ Created ${suppliersData.length} suppliers`);

  // Create products
  const productsData = [
    // MAS ARIS (4 products)
    { supplierName: "MAS ARIS", name: "Lapis", costPrice: 1250, sellingPrice: 1500, category: "Kue Basah" },
    { supplierName: "MAS ARIS", name: "Bugis", costPrice: 1250, sellingPrice: 1500, category: "Kue Basah" },
    { supplierName: "MAS ARIS", name: "Bolu Panggang", costPrice: 1250, sellingPrice: 1500, category: "Bolu" },
    { supplierName: "MAS ARIS", name: "Bolu Kelapa", costPrice: 1250, sellingPrice: 1500, category: "Bolu" },
    
    // MAS YANTO (10 products)
    { supplierName: "MAS YANTO", name: "Risol Segitiga", costPrice: 800, sellingPrice: 1000, category: "Risol" },
    { supplierName: "MAS YANTO", name: "Risol Sosis", costPrice: 800, sellingPrice: 1000, category: "Risol" },
    { supplierName: "MAS YANTO", name: "Risol Kentang", costPrice: 800, sellingPrice: 1000, category: "Risol" },
    { supplierName: "MAS YANTO", name: "Bolu Kukus Warna", costPrice: 800, sellingPrice: 1000, category: "Bolu Kukus" },
    { supplierName: "MAS YANTO", name: "Bolu Kukus Ketan", costPrice: 800, sellingPrice: 1000, category: "Bolu Kukus" },
    { supplierName: "MAS YANTO", name: "Donat", costPrice: 800, sellingPrice: 1000, category: "Gorengan" },
    { supplierName: "MAS YANTO", name: "Sus Cream", costPrice: 800, sellingPrice: 1000, category: "Kue Basah" },
    { supplierName: "MAS YANTO", name: "Risol Ayam", costPrice: 800, sellingPrice: 1000, category: "Risol" },
    { supplierName: "MAS YANTO", name: "Risol Mayo", costPrice: 2500, sellingPrice: 3000, category: "Risol" },
    { supplierName: "MAS YANTO", name: "Pizza", costPrice: 4000, sellingPrice: 5000, category: "Kue Basah" },
    
    // PAK ADE (1 product)
    { supplierName: "PAK ADE", name: "Sus Fla", costPrice: 800, sellingPrice: 1000, category: "Kue Basah" },
    
    // PAK SUGIMAN (1 product)
    { supplierName: "PAK SUGIMAN", name: "Cente Putih", costPrice: 800, sellingPrice: 1000, category: "Cente" },
    
    // IBU DEDAH (4 products)
    { supplierName: "IBU DEDAH", name: "Cente Pisang", costPrice: 1250, sellingPrice: 1750, category: "Cente" },
    { supplierName: "IBU DEDAH", name: "Cente Coklat", costPrice: 1250, sellingPrice: 1750, category: "Cente" },
    { supplierName: "IBU DEDAH", name: "Cente Jagung", costPrice: 1250, sellingPrice: 1750, category: "Cente" },
    { supplierName: "IBU DEDAH", name: "Cente Kecil", costPrice: 800, sellingPrice: 1000, category: "Cente" },
    
    // MAMAH DIKA (3 products)
    { supplierName: "MAMAH DIKA", name: "Risol Cengek", costPrice: 4000, sellingPrice: 5000, category: "Risol" },
    { supplierName: "MAMAH DIKA", name: "Dimsum", costPrice: 3000, sellingPrice: 4000, category: "Chinese" },
    { supplierName: "MAMAH DIKA", name: "Lontong", costPrice: 1600, sellingPrice: 2000, category: "Kue Basah" },
    
    // PAK MASMUR (9 products)
    { supplierName: "PAK MASMUR", name: "Bola Susu", costPrice: 2500, sellingPrice: 3000, category: "Kue Basah" },
    { supplierName: "PAK MASMUR", name: "Bola Coklat", costPrice: 2500, sellingPrice: 3000, category: "Kue Basah" },
    { supplierName: "PAK MASMUR", name: "Wajit", costPrice: 2500, sellingPrice: 3000, category: "Kue Basah" },
    { supplierName: "PAK MASMUR", name: "Bolu Ketan", costPrice: 2500, sellingPrice: 3000, category: "Bolu" },
    { supplierName: "PAK MASMUR", name: "Bolu Sarang Semut", costPrice: 2500, sellingPrice: 3000, category: "Bolu" },
    { supplierName: "PAK MASMUR", name: "Bolu Brownies", costPrice: 2500, sellingPrice: 3000, category: "Bolu" },
    { supplierName: "PAK MASMUR", name: "Pai", costPrice: 2500, sellingPrice: 3000, category: "Kue Basah" },
    { supplierName: "PAK MASMUR", name: "Gabin", costPrice: 1500, sellingPrice: 2000, category: "Kue Basah" },
    { supplierName: "PAK MASMUR", name: "Bolen", costPrice: 1500, sellingPrice: 2000, category: "Kue Basah" },
    
    // PAK MUHIDIN (2 products)
    { supplierName: "PAK MUHIDIN", name: "Lilit", costPrice: 2000, sellingPrice: 2500, category: "Kue Basah" },
    { supplierName: "PAK MUHIDIN", name: "Nagasari", costPrice: 2100, sellingPrice: 2500, category: "Kue Basah" },
    
    // IBU NUR (3 products)
    { supplierName: "IBU NUR", name: "Bika Ambon", costPrice: 800, sellingPrice: 1000, category: "Kue Basah" },
    { supplierName: "IBU NUR", name: "Dadar Gulung Ubi", costPrice: 800, sellingPrice: 1000, category: "Dadar Gulung" },
    { supplierName: "IBU NUR", name: "Sosis Solo", costPrice: 1200, sellingPrice: 1500, category: "Kue Basah" },
    
    // PAK ROHMAT (1 product)
    { supplierName: "PAK ROHMAT", name: "Pisang Adeboy", costPrice: 1600, sellingPrice: 2000, category: "Kue Basah" },
    
    // ADE BOY (2 products)
    { supplierName: "ADE BOY", name: "Pastel", costPrice: 800, sellingPrice: 1000, category: "Kue Basah" },
    { supplierName: "ADE BOY", name: "Roti Goreng", costPrice: 450, sellingPrice: 1000, category: "Gorengan" },
    
    // PAK USTAD (2 products)
    { supplierName: "PAK USTAD", name: "Dadar Gulung", costPrice: 800, sellingPrice: 1000, category: "Dadar Gulung" },
    { supplierName: "PAK USTAD", name: "Ketan Bumbu", costPrice: 800, sellingPrice: 1000, category: "Kue Basah" },
    
    // MAS WARMAN (1 product)
    { supplierName: "MAS WARMAN", name: "Putu Ayu Ungu", costPrice: 800, sellingPrice: 1000, category: "Putu Ayu" },
    
    // IBU LINA (1 product)
    { supplierName: "IBU LINA", name: "Cucur", costPrice: 800, sellingPrice: 1000, category: "Kue Basah" },
    
    // MAS PARJO (2 products)
    { supplierName: "MAS PARJO", name: "Risoles", costPrice: 800, sellingPrice: 1000, category: "Risol" },
    { supplierName: "MAS PARJO", name: "Putu Ayu Merah", costPrice: 800, sellingPrice: 1000, category: "Putu Ayu" },
    
    // TEH DAWA (3 products)
    { supplierName: "TEH DAWA", name: "Puding Gula Merah", costPrice: 800, sellingPrice: 1000, category: "Puding" },
    { supplierName: "TEH DAWA", name: "Combro", costPrice: 800, sellingPrice: 1000, category: "Gorengan" },
    { supplierName: "TEH DAWA", name: "Buras", costPrice: 800, sellingPrice: 1000, category: "Kue Basah" },
    
    // IBU ERNI (3 products)
    { supplierName: "IBU ERNI", name: "Putu Ayu", costPrice: 800, sellingPrice: 1000, category: "Putu Ayu" },
    { supplierName: "IBU ERNI", name: "Onde", costPrice: 800, sellingPrice: 1000, category: "Kue Basah" },
    { supplierName: "IBU ERNI", name: "Lemper Ayam Kecil", costPrice: 800, sellingPrice: 1000, category: "Lemper" },
    
    // MBA RIA (1 product)
    { supplierName: "MBA RIA", name: "Lemper Ayam Sedang", costPrice: 800, sellingPrice: 1000, category: "Lemper" },
    
    // PAK KOKO (4 products)
    { supplierName: "PAK KOKO", name: "Lemper Ayam Besar", costPrice: 1200, sellingPrice: 1500, category: "Lemper" },
    { supplierName: "PAK KOKO", name: "Lemper Ayam Bakar", costPrice: 1250, sellingPrice: 1500, category: "Lemper" },
    { supplierName: "PAK KOKO", name: "Dadar Gulung Fla", costPrice: 1000, sellingPrice: 1250, category: "Dadar Gulung" },
    { supplierName: "PAK KOKO", name: "Talam", costPrice: 1000, sellingPrice: 1250, category: "Kue Basah" },
    
    // BANG ZACK (1 product)
    { supplierName: "BANG ZACK", name: "Donat Palem", costPrice: 800, sellingPrice: 1000, category: "Gorengan" },
    
    // DESTA (2 products)
    { supplierName: "DESTA", name: "Donat Camerok", costPrice: 800, sellingPrice: 1500, category: "Gorengan" },
    { supplierName: "DESTA", name: "Bolu Rainbow", costPrice: 1000, sellingPrice: 1500, category: "Bolu" },
    
    // MAS PANJUL (2 products)
    { supplierName: "MAS PANJUL", name: "Sate Aci", costPrice: 800, sellingPrice: 1000, category: "Kue Basah" },
    { supplierName: "MAS PANJUL", name: "Nona Manis", costPrice: 800, sellingPrice: 1000, category: "Kue Basah" },
    
    // IBU IDDAH (3 products)
    { supplierName: "IBU IDDAH", name: "Lupcup", costPrice: 800, sellingPrice: 1000, category: "Kue Basah" },
    { supplierName: "IBU IDDAH", name: "Puding Cup", costPrice: 800, sellingPrice: 1000, category: "Puding" },
    { supplierName: "IBU IDDAH", name: "Puding Potong", costPrice: 800, sellingPrice: 1000, category: "Puding" },
    
    // IBU SATE (1 product)
    { supplierName: "IBU SATE", name: "Martabak Telur", costPrice: 3500, sellingPrice: 4000, category: "Kue Basah" },
    
    // MAS BOKIR (1 product)
    { supplierName: "MAS BOKIR", name: "Bacang Kecil", costPrice: 800, sellingPrice: 1000, category: "Bacang" },
    
    // PAK TEMI (4 products)
    { supplierName: "PAK TEMI", name: "Bacang Besar", costPrice: 1000, sellingPrice: 1250, category: "Bacang" },
    { supplierName: "PAK TEMI", name: "Bolu Kukus Aren", costPrice: 1000, sellingPrice: 1250, category: "Bolu Kukus" },
    { supplierName: "PAK TEMI", name: "Bolu Pisang", costPrice: 1000, sellingPrice: 1250, category: "Bolu" },
    { supplierName: "PAK TEMI", name: "Bolu Kacang", costPrice: 1000, sellingPrice: 1250, category: "Bolu" },
    
    // MAS UDIN (2 products)
    { supplierName: "MAS UDIN", name: "Brownies", costPrice: 3000, sellingPrice: 4000, category: "Bolu" },
    { supplierName: "MAS UDIN", name: "Cheese Roll", costPrice: 3500, sellingPrice: 4000, category: "Kue Basah" },
    
    // EMAK AREN (2 products)
    { supplierName: "EMAK AREN", name: "Pastry", costPrice: 2000, sellingPrice: 3000, category: "Kue Basah" },
    { supplierName: "EMAK AREN", name: "Caca", costPrice: 2800, sellingPrice: 3000, category: "Kue Basah" },
    
    // IBU HETTI (8 products)
    { supplierName: "IBU HETTI", name: "Bola Susu", costPrice: 2500, sellingPrice: 3000, category: "Kue Basah" },
    { supplierName: "IBU HETTI", name: "Risol Mayo", costPrice: 1700, sellingPrice: 2000, category: "Risol" },
    { supplierName: "IBU HETTI", name: "Bolu Rainbow", costPrice: 2500, sellingPrice: 3000, category: "Bolu" },
    { supplierName: "IBU HETTI", name: "Lapis", costPrice: 800, sellingPrice: 1000, category: "Kue Basah" },
    { supplierName: "IBU HETTI", name: "Bolu Kukus", costPrice: 1000, sellingPrice: 1250, category: "Bolu Kukus" },
    { supplierName: "IBU HETTI", name: "Pai", costPrice: 2000, sellingPrice: 2500, category: "Kue Basah" },
    { supplierName: "IBU HETTI", name: "Gabin", costPrice: 1200, sellingPrice: 1500, category: "Kue Basah" },
    { supplierName: "IBU HETTI", name: "Bolen", costPrice: 1500, sellingPrice: 2000, category: "Kue Basah" },
  ];

  let productsCreated = 0;
  for (const productData of productsData) {
    const supplierId = suppliers[productData.supplierName];
    if (!supplierId) continue;

    const slug =
      productData.name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "") +
      "-" +
      Date.now().toString(36) +
      "-" +
      productsCreated;

    await prisma.product.upsert({
      where: {
        supplierId_name: {
          supplierId,
          name: productData.name,
        },
      },
      update: {
        costPrice: productData.costPrice,
        sellingPrice: productData.sellingPrice,
        category: productData.category,
      },
      create: {
        supplierId,
        name: productData.name,
        slug,
        costPrice: productData.costPrice,
        sellingPrice: productData.sellingPrice,
        category: productData.category,
        unit: "pcs",
        minStock: 10,
      },
    });
    productsCreated++;
  }
  console.log(`✅ Created ${productsCreated} products`);

  console.log("🎉 Seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });