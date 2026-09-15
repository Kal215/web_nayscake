import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, requireAdmin } from "@/lib/api";
import { cekKunciBot } from "@/lib/botAuth";
import { z } from "zod";

export async function POST(request: Request) {
  const denied = cekKunciBot(request); if (denied) return denied;
  try {
    const body = z.object({ pending: z.number().int().min(0), failed: z.number().int().min(0) }).parse(await request.json());
    const value = JSON.stringify({ ...body, lastSeen: new Date().toISOString() });
    await prisma.settings.upsert({ where: { key: "bot-health" }, create: { key: "bot-health", value }, update: { value } });
    return NextResponse.json({ ok: true });
  } catch (error) { return apiError(error); }
}
export async function GET() {
  try {
    await requireAdmin();
    const row = await prisma.settings.findUnique({ where: { key: "bot-health" } });
    const health = row ? JSON.parse(row.value) : null;
    return NextResponse.json({ ...health, online: !!health && Date.now() - Date.parse(health.lastSeen) < 180000 });
  } catch (error) { return apiError(error); }
}
