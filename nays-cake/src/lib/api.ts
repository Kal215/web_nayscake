import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cekKunciBot } from "@/lib/botAuth";

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function requireAdmin(superAdmin = false) {
  const session = await auth();
  if (!session?.user?.id) throw new ApiError(401, "Silakan login kembali");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || (superAdmin && user.role !== "SUPER_ADMIN")) throw new ApiError(403, "Akses tidak diizinkan");
  return user;
}

export async function requireOperator(request: Request) {
  if (request.headers.has("x-api-key")) {
    const denied = cekKunciBot(request);
    if (denied) throw new ApiError(denied.status, "Kunci bot tidak valid");
    return "bot";
  }
  return (await requireAdmin()).id;
}

export function apiError(error: unknown) {
  if (error instanceof ApiError) return NextResponse.json({ error: error.message }, { status: error.status });
  if (error instanceof ZodError || error instanceof SyntaxError) return NextResponse.json({ error: "Data tidak valid", details: error instanceof ZodError ? error.issues.map(i => i.message) : undefined }, { status: 400 });
  if (error && typeof error === "object" && "code" in error) {
    if (error.code === "P2002") return NextResponse.json({ error: "Data sudah ada. Muat ulang dan coba kembali." }, { status: 409 });
    if (error.code === "P2025") return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
  }
  console.error("API error", error);
  return NextResponse.json({ error: "Gagal memproses permintaan" }, { status: 500 });
}
