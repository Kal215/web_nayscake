require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaNeon } = require("@prisma/adapter-neon");

const prisma = new PrismaClient({ 
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }) 
});

async function addSalesData() {
  console.log("Adding sample sales data...");

  const products = await prisma.product.findMany({ include: { supplier: true } });
  console.log(`Found ${products.length} products`);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  console.log("\nAdding stock entries (barang masuk)...");
  for (const product of products) {
    const quantity = Math.floor(Math.random() * 91) + 10;
    await prisma.stockEntry.create({
      data: {
        productId: product.id,
        date: today,
        quantityIn: quantity,
      }
    });
  }
  console.log(`  Created ${products.length} stock entries`);

  console.log("\nAdding sales data for past 7 days...");
  let totalSales = 0;
  
  for (let day = 7; day >= 0; day--) {
    const saleDate = new Date(today);
    saleDate.setDate(saleDate.getDate() - day);
    
    const salesPerDay = Math.floor(Math.random() * 11) + 5;
    
    for (let s = 0; s < salesPerDay; s++) {
      const numProducts = Math.floor(Math.random() * 5) + 1;
      const selectedProducts = products
        .sort(() => Math.random() - 0.5)
        .slice(0, numProducts);
      
      let totalAmount = 0;
      let totalCost = 0;
      let totalProfit = 0;
      const saleItems = [];

      for (const product of selectedProducts) {
        const qty = Math.floor(Math.random() * 10) + 1;
        const subtotal = Number(product.sellingPrice) * qty;
        const cost = Number(product.costPrice) * qty;
        const profit = subtotal - cost;
        
        saleItems.push({
          productId: product.id,
          supplierId: product.supplierId,
          quantity: qty,
          price: product.sellingPrice,
          cost: product.costPrice,
          subtotal: subtotal,
          profit: profit,
        });
        
        totalAmount += subtotal;
        totalCost += cost;
        totalProfit += profit;
      }

      await prisma.sale.create({
        data: {
          saleDate: saleDate,
          totalAmount: totalAmount,
          totalCost: totalCost,
          totalProfit: totalProfit,
          items: {
            create: saleItems,
          },
        },
      });
      totalSales++;
    }
    
    console.log(`  Day ${day}: ${salesPerDay} sales`);
  }

  console.log(`\n✅ Sample data added successfully!`);
  console.log(`- ${products.length} stock entries`);
  console.log(`- ${totalSales} sales for past 7 days`);
  
  await prisma.$disconnect();
}

addSalesData().catch(console.error);
