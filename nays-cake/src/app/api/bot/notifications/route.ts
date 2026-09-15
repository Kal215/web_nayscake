import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cekKunciBot } from "@/lib/botAuth";
import { apiError } from "@/lib/api";
import { z } from "zod";
export async function GET(request: Request) {
  const denied = cekKunciBot(request); if (denied) return denied;
  try { return NextResponse.json({ notifications: await prisma.notification.findMany({ where: { sentAt: null }, orderBy: { createdAt: "asc" }, take: 50 }) }); }
  catch (error) { return apiError(error); }
}
export async function POST(request: Request) {
  const denied = cekKunciBot(request); if (denied) return denied;
  try {
    const { ids } = z.object({ ids: z.array(z.string().min(1)).min(1).max(50) }).parse(await request.json());
    await prisma.notification.updateMany({ where: { id: { in: ids }, sentAt: null }, data: { sentAt: new Date() } });
    return NextResponse.json({ ok: true });
  } catch (error) { return apiError(error); }
}
