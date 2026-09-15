import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, requireAdmin } from "@/lib/api";
import { audit, transaction } from "@/lib/business";
import { z } from "zod";
export async function GET() {
  try {
    await requireAdmin();
    const suppliers = await prisma.supplier.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } });
    return NextResponse.json({ suppliers });
  } catch (error) { return apiError(error); }
}
export async function POST(request: Request) {
  try {
    const user = await requireAdmin();
    const data = z.object({ name: z.string().trim().min(1).max(150), phone: z.string().max(30).nullish(), address: z.string().max(500).nullish(), notes: z.string().max(2000).nullish() }).parse(await request.json());
    const supplier = await transaction(async tx => {
      const result = await tx.supplier.create({ data });
      await audit(tx, user.id, "SUPPLIER_CREATED", result.id);
      return result;
    });
    return NextResponse.json({ supplier }, { status: 201 });
  } catch (error) { return apiError(error); }
}
