import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {};
    if (startDate && endDate) {
      where.saleDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const sales = await prisma.sale.findMany({
      where,
      orderBy: { saleDate: "desc" },
      take: limit,
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    return NextResponse.json({ sales });
  } catch (error) {
    console.error("Failed to fetch sales:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, customerName, paymentMethod, notes } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Items are required" },
        { status: 400 }
      );
    }

    // Calculate totals
    let totalAmount = 0;
    let totalCost = 0;

    const saleItems = items.map((item: any) => {
      const subtotal = Number(item.price) * item.quantity;
      const cost = Number(item.cost) * item.quantity;
      totalAmount += subtotal;
      totalCost += cost;
      return {
        productId: item.productId,
        supplierId: item.supplierId,
        quantity: item.quantity,
        price: item.price,
        cost: item.cost,
        subtotal: subtotal,
        profit: subtotal - cost,
      };
    });

    const sale = await prisma.sale.create({
      data: {
        totalAmount: totalAmount,
        totalCost: totalCost,
        totalProfit: totalAmount - totalCost,
        customerName,
        paymentMethod,
        notes,
        items: {
          create: saleItems,
        },
      },
    });

    return NextResponse.json({ sale }, { status: 201 });
  } catch (error) {
    console.error("Failed to create sale:", error);
    return NextResponse.json(
      { error: "Failed to create sale" },
      { status: 500 }
    );
  }
}
