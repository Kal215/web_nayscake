import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, requireAdmin } from "@/lib/api";
import { transaction } from "@/lib/business";
import { recordSale } from "@/lib/sales";
import { quantity } from "@/lib/validation";
import { z } from "zod";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const q = new URL(request.url).searchParams;
    const limit = z.coerce.number().int().min(1).max(100).parse(q.get("limit") || 50);
    const sales = await prisma.sale.findMany({ orderBy: { saleDate: "desc" }, take: limit, include: { _count: { select: { items: true } } } });
    return NextResponse.json({ sales });
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  let requestKey: string | undefined;
  try {
    const user = await requireAdmin();
    const input = z.object({ requestKey: z.string().uuid(), items: z.array(z.object({ productId: z.string().min(1), quantity })).min(1).max(100), customerName: z.string().max(150).optional(), paymentMethod: z.enum(["cash", "transfer"]).optional(), notes: z.string().max(2000).optional() }).parse(await request.json());
    requestKey = input.requestKey;
    const sale = await transaction(tx => recordSale(tx, input, user.id));
    return NextResponse.json({ sale }, { status: 201 });
  } catch (error) {
    if (requestKey && error && typeof error === "object" && "code" in error && error.code === "P2002") {
      const existing = await prisma.sale.findUnique({ where: { requestKey } });
      if (existing) return NextResponse.json({ sale: existing }, { status: 201 });
    }
    return apiError(error);
  }
}
