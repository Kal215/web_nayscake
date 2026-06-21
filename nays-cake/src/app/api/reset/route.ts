import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/reset - Reset all daily data (sales, sale_items, stock_entries)
export async function POST() {
  try {
    // Get all sales for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Delete all sale items from today's sales
    const todaySales = await prisma.sale.findMany({
      where: {
        saleDate: {
          gte: today,
        },
      },
    });
    
    const saleIds = todaySales.map((sale: { id: string }) => sale.id);
    
    if (saleIds.length > 0) {
      await prisma.saleItem.deleteMany({
        where: {
          saleId: {
            in: saleIds,
          },
        },
      });
      
      await prisma.sale.deleteMany({
        where: {
          id: {
            in: saleIds,
          },
        },
      });
    }
    
    // Delete all stock entries for today (they will be re-entered)
    await prisma.stockEntry.deleteMany({
      where: {
        date: {
          gte: today,
        },
      },
    });
    
    return NextResponse.json({
      success: true,
      message: "Daily data reset successfully",
      deletedSales: saleIds.length,
    });
  } catch (error) {
    console.error("Reset error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset daily data" },
      { status: 500 }
    );
  }
}

// GET /api/reset - Get today's summary
export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaySales = await prisma.sale.findMany({
      where: {
        saleDate: {
          gte: today,
        },
      },
      include: {
        items: true,
      },
    });
    
    const todayStockEntries = await prisma.stockEntry.findMany({
      where: {
        date: {
          gte: today,
        },
      },
    });
    
    const totalSales = todaySales.length;
    const totalRevenue = todaySales.reduce((sum: number, sale: { totalAmount: { toString: () => string; }; }) => sum + Number(sale.totalAmount), 0);
    const totalProfit = todaySales.reduce((sum: number, sale: { totalProfit: { toString: () => string; }; }) => sum + Number(sale.totalProfit), 0);
    const totalItemsSold = todaySales.reduce(
      (sum: number, sale: { items: { quantity: number; }[]; }) => sum + sale.items.reduce((itemSum: number, item: { quantity: number; }) => itemSum + item.quantity, 0),
      0
    );
    const totalStockEntries = todayStockEntries.reduce(
      (sum: number, entry: { quantityIn: number; }) => sum + entry.quantityIn,
      0
    );
    
    return NextResponse.json({
      date: today.toISOString().split("T")[0],
      totalSales,
      totalRevenue,
      totalProfit,
      totalItemsSold,
      totalStockEntries,
    });
  } catch (error) {
    console.error("Get summary error:", error);
    return NextResponse.json(
      { error: "Failed to get summary" },
      { status: 500 }
    );
  }
}
