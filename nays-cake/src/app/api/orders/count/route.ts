import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, requireAdmin } from "@/lib/api";
export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json({ count: await prisma.order.count({ where: { status: "MENUNGGU" } }) });
  } catch (error) { return apiError(error); }
}
