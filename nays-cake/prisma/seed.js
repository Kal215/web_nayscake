require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaNeon } = require("@prisma/adapter-neon");
const bcrypt = require("bcryptjs");

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

// Products data with correct categories
const productsData = [
  // Lemper & Bacang
  { supplierName: "PAK KOKO", name: "Lemper Ayam Kecil", costPrice: 800, sellingPrice: 1000, category: "Lemper & Bacang" },
  { supplierName: "PAK KOKO", name: "Lemper Ayam Sedang", costPrice: 1250, sellingPrice: 1500, category: "Lemper & Bacang" },
  { supplierName: "PAK KOKO", name: "Lemper Ayam Besar", costPrice: 1600, sellingPrice: 2000, category: "Lemper & Bacang" },
  { supplierName: "PAK KOKO", name: "Lemper Ayam Bakar", costPrice: 800, sellingPrice: 1000, category: "Lemper & Bacang" },
  { supplierName: "MAS UDIN", name: "Bacang Kecil", costPrice: 2500, sellingPrice: 3000, category: "Lemper & Bacang" },
  { supplierName: "MAS UDIN", name: "Bacang Besar", costPrice: 4000, sellingPrice: 5000, category: "Lemper & Bacang" },

  // Kue Basah
  { supplierName: "MAS ARIS", name: "Lapis", costPrice: 1250, sellingPrice: 1500, category: "Kue Basah" },
  { supplierName: "MAS ARIS", name: "Bugis", costPrice: 1250, sellingPrice: 1500, category: "Kue Basah" },
  { supplierName: "IBU NUR", name: "Nagasari", costPrice: 800, sellingPrice: 1000, category: "Kue Basah" },
  { supplierName: "MBA RIA", name: "Putu Ayu", costPrice: 800, sellingPrice: 1000, category: "Kue Basah" },
  { supplierName: "TEH DAWA", name: "Putu Ayu Merah", costPrice: 800, sellingPrice: 1000, category: "Kue Basah" },
  { supplierName: "MAS PARJO", name: "Putu Ayu Ungu", costPrice: 800, sellingPrice: 1000, category: "Kue Basah" },
  { supplierName: "MAS WARMAN", name: "Dadar Gulung", costPrice: 800, sellingPrice: 1000, category: "Kue Basah" },
  { supplierName: "IBU NUR", name: "Dadar Gulung Ubi", costPrice: 800, sellingPrice: 1000, category: "Kue Basah" },
  { supplierName: "DESTA", name: "Dadar Gulung Fla", costPrice: 800, sellingPrice: 1000, category: "Kue Basah" },
  { supplierName: "PAK SUGIMAN", name: "Cente Putih", costPrice: 800, sellingPrice: 1000, category: "Kue Basah" },
  { supplierName: "IBU DEDAH", name: "Cente Pisang", costPrice: 1400, sellingPrice: 2000, category: "Kue Basah" },
  { supplierName: "IBU DEDAH", name: "Cente Coklat", costPrice: 1400, sellingPrice: 2000, category: "Kue Basah" },
  { supplierName: "IBU DEDAH", name: "Cente Jagung", costPrice: 1400, sellingPrice: 2000, category: "Kue Basah" },
  { supplierName: "IBU DEDAH", name: "Cente Kecil", costPrice: 800, sellingPrice: 1000, category: "Kue Basah" },
  { supplierName: "MAS PANJUL", name: "Talam", costPrice: 800, sellingPrice: 1000, category: "Kue Basah" },
  { supplierName: "IBU NUR", name: "Bika Ambon", costPrice: 1200, sellingPrice: 1500, category: "Kue Basah" },
  { supplierName: "MAS BOKIR", name: "Nona Manis", costPrice: 800, sellingPrice: 1000, category: "Kue Basah" },
  { supplierName: "MAS PARJO", name: "Cucur", costPrice: 800, sellingPrice: 1000, category: "Kue Basah" },
  { supplierName: "IBU LINA", name: "Ketan Bumbu", costPrice: 800, sellingPrice: 1000, category: "Kue Basah" },

  // Jajanan Tradisional
  { supplierName: "IBU IDDAH", name: "Onde", costPrice: 800, sellingPrice: 1000, category: "Jajanan Tradisional" },
  { supplierName: "PAK MASMUR", name: "Wajit", costPrice: 2500, sellingPrice: 3000, category: "Jajanan Tradisional" },
  { supplierName: "PAK MASMUR", name: "Gabin", costPrice: 2000, sellingPrice: 2500, category: "Jajanan Tradisional" },
  { supplierName: "PAK MASMUR", name: "Lontong", costPrice: 1250, sellingPrice: 1500, category: "Jajanan Tradisional" },
  { supplierName: "IBU ERNI", name: "Buras", costPrice: 800, sellingPrice: 1000, category: "Jajanan Tradisional" },

  // Roti & Bolen
  { supplierName: "PAK MUHIDIN", name: "Bolen", costPrice: 1600, sellingPrice: 2000, category: "Roti & Bolen" },
  { supplierName: "PAK MUHIDIN", name: "Lilit", costPrice: 2500, sellingPrice: 3000, category: "Roti & Bolen" },
  { supplierName: "PAK USTAD", name: "Roti Goreng", costPrice: 800, sellingPrice: 1000, category: "Roti & Bolen" },

  // Bolu & Cake
  { supplierName: "MAS ARIS", name: "Bolu Panggang", costPrice: 1250, sellingPrice: 1500, category: "Bolu & Cake" },
  { supplierName: "MAS ARIS", name: "Bolu Kelapa", costPrice: 1250, sellingPrice: 1500, category: "Bolu & Cake" },
  { supplierName: "MAS YANTO", name: "Bolu Kukus Warna", costPrice: 800, sellingPrice: 1000, category: "Bolu & Cake" },
  { supplierName: "MAS YANTO", name: "Bolu Kukus Ketan", costPrice: 800, sellingPrice: 1000, category: "Bolu & Cake" },
  { supplierName: "EMAK AREN", name: "Bolu Kukus Aren", costPrice: 800, sellingPrice: 1000, category: "Bolu & Cake" },
  { supplierName: "DESTA", name: "Bolu Rainbow", costPrice: 1000, sellingPrice: 1500, category: "Bolu & Cake" },
  { supplierName: "IBU HETTI", name: "Bolu Rainbow", costPrice: 2500, sellingPrice: 3000, category: "Bolu & Cake" },
  { supplierName: "IBU HETTI", name: "Bolu Pisang", costPrice: 2500, sellingPrice: 3000, category: "Bolu & Cake" },
  { supplierName: "IBU HETTI", name: "Bolu Kacang", costPrice: 2600, sellingPrice: 3000, category: "Bolu & Cake" },
  { supplierName: "PAK MASMUR", name: "Bolu Ketan", costPrice: 2500, sellingPrice: 3000, category: "Bolu & Cake" },
  { supplierName: "PAK MASMUR", name: "Bolu Sarang Semut", costPrice: 2500, sellingPrice: 3000, category: "Bolu & Cake" },
  { supplierName: "PAK MASMUR", name: "Bolu Brownies", costPrice: 2500, sellingPrice: 3000, category: "Bolu & Cake" },
  { supplierName: "IBU HETTI", name: "Brownies", costPrice: 2600, sellingPrice: 3000, category: "Bolu & Cake" },
  { supplierName: "PAK MASMUR", name: "Bola Susu", costPrice: 2500, sellingPrice: 3000, category: "Bolu & Cake" },
  { supplierName: "IBU HETTI", name: "Bola Susu", costPrice: 2500, sellingPrice: 3000, category: "Bolu & Cake" },
  { supplierName: "PAK MASMUR", name: "Bola Coklat", costPrice: 3500, sellingPrice: 4000, category: "Bolu & Cake" },

  // Puding & Dessert
  { supplierName: "PAK TEMI", name: "Puding Cup", costPrice: 800, sellingPrice: 1000, category: "Puding & Dessert" },
  { supplierName: "PAK TEMI", name: "Puding Potong", costPrice: 800, sellingPrice: 1000, category: "Puding & Dessert" },
  { supplierName: "IBU ERNI", name: "Puding Gula Merah", costPrice: 800, sellingPrice: 1000, category: "Puding & Dessert" },
  { supplierName: "PAK ADE", name: "Sus Fla", costPrice: 800, sellingPrice: 1000, category: "Puding & Dessert" },
  { supplierName: "MAS YANTO", name: "Sus Cream", costPrice: 800, sellingPrice: 1000, category: "Puding & Dessert" },
  { supplierName: "IBU HETTI", name: "Cheese Roll", costPrice: 2600, sellingPrice: 3000, category: "Puding & Dessert" },
  { supplierName: "IBU HETTI", name: "Pastry", costPrice: 2600, sellingPrice: 3000, category: "Puding & Dessert" },
  { supplierName: "PAK TEMI", name: "Lupcup", costPrice: 1600, sellingPrice: 2000, category: "Puding & Dessert" },

  // Donat & Pastry
  { supplierName: "MAS YANTO", name: "Donat", costPrice: 800, sellingPrice: 1000, category: "Donat & Pastry" },
  { supplierName: "IBU IDDAH", name: "Donat Palem", costPrice: 800, sellingPrice: 1000, category: "Donat & Pastry" },
  { supplierName: "IBU IDDAH", name: "Donat Camerok", costPrice: 800, sellingPrice: 1000, category: "Donat & Pastry" },

  // Gorengan & Snack Asin
  { supplierName: "MAS YANTO", name: "Risol Segitiga", costPrice: 800, sellingPrice: 1000, category: "Gorengan & Snack Asin" },
  { supplierName: "MAMAH DIKA", name: "Risol Segitiga", costPrice: 800, sellingPrice: 1000, category: "Gorengan & Snack Asin" },
  { supplierName: "MAS YANTO", name: "Risol Sosis", costPrice: 800, sellingPrice: 1000, category: "Gorengan & Snack Asin" },
  { supplierName: "MAS YANTO", name: "Risol Kentang", costPrice: 800, sellingPrice: 1000, category: "Gorengan & Snack Asin" },
  { supplierName: "MAS YANTO", name: "Risol Ayam", costPrice: 1600, sellingPrice: 2000, category: "Gorengan & Snack Asin" },
  { supplierName: "MAS YANTO", name: "Risol Mayo", costPrice: 2500, sellingPrice: 3000, category: "Gorengan & Snack Asin" },
  { supplierName: "ADE BOY", name: "Risol Mayo", costPrice: 1700, sellingPrice: 2000, category: "Gorengan & Snack Asin" },
  { supplierName: "MAMAH DIKA", name: "Risol Cengek", costPrice: 800, sellingPrice: 1000, category: "Gorengan & Snack Asin" },
  { supplierName: "TEH DAWA", name: "Risoles", costPrice: 800, sellingPrice: 1000, category: "Gorengan & Snack Asin" },
  { supplierName: "PAK USTAD", name: "Pastel", costPrice: 800, sellingPrice: 1000, category: "Gorengan & Snack Asin" },
  { supplierName: "IBU ERNI", name: "Combro", costPrice: 800, sellingPrice: 1000, category: "Gorengan & Snack Asin" },
  { supplierName: "PAK TEMI", name: "Martabak Telur", costPrice: 800, sellingPrice: 1000, category: "Gorengan & Snack Asin" },
  { supplierName: "PAK ROHMAT", name: "Sosis Solo", costPrice: 1600, sellingPrice: 2000, category: "Gorengan & Snack Asin" },

  // Menu Spesial
  { supplierName: "MAS YANTO", name: "Pizza", costPrice: 4000, sellingPrice: 5000, category: "Menu Spesial" },
  { supplierName: "EMAK AREN", name: "Pizza", costPrice: 4000, sellingPrice: 5000, category: "Menu Spesial" },
  { supplierName: "MAMAH DIKA", name: "Dimsum", costPrice: 10000, sellingPrice: 12000, category: "Menu Spesial" },
  { supplierName: "IBU SATE", name: "Sate Aci", costPrice: 3500, sellingPrice: 4000, category: "Menu Spesial" },
];

async function main() {
  console.log("Starting seed with correct categories...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@nayscake.com" },
    update: {},
    create: {
      name: "Admin Nay's Cake",
      email: "admin@nayscake.com",
      password: hashedPassword,
      role: "SUPER_ADMIN",
    },
  });
  console.log("Created admin user");

  // Create products
  let productCount = 0;
  for (const productData of productsData) {
    const supplier = await prisma.supplier.upsert({
      where: { name: productData.supplierName },
      update: {},
      create: { name: productData.supplierName },
    });

    const slug = `${productData.name.toLowerCase().replace(/\s+/g, "-")}-${productData.supplierName.toLowerCase().replace(/\s+/g, "-")}`.replace(/[^a-z0-9-]/g, "");

    await prisma.product.upsert({
      where: { supplierId_name: { supplierId: supplier.id, name: productData.name } },
      update: { category: productData.category },
      create: {
        supplierId: supplier.id,
        name: productData.name,
        slug,
        costPrice: productData.costPrice,
        sellingPrice: productData.sellingPrice,
        category: productData.category,
        unit: "pcs",
        minStock: 10,
        imageUrl: `/images/suppliers/${productData.supplierName.toLowerCase().replace(/\s+/g, "_")}/${slug}.jpg`,
      },
    });
    productCount++;
  }
  console.log(`Created ${productCount} products with correct categories`);

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
