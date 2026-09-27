import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { cekKunciBot } from "@/lib/botAuth";

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function requireAdmin(superAdmin = false) {
  // Gunakan pemindai KTP Clerk!
  const user = await currentUser();
  if (!user) throw new ApiError(401, "Silakan login kembali");

  const primaryEmail = user.emailAddresses?.[0]?.emailAddress || "";
  let dbUser = null;
  
  if (primaryEmail) {
    dbUser = await prisma.user.findFirst({ where: { email: primaryEmail } });
  }

  // Pengecekan Mutlak
  const isAdmin = dbUser?.role === "ADMIN" || dbUser?.role === "SUPER_ADMIN" || primaryEmail === "riskalfadhilla215@gmail.com";
  
  if (!isAdmin) {
    throw new ApiError(403, "Akses tidak diizinkan");
  }

  if (superAdmin && dbUser?.role !== "SUPER_ADMIN" && primaryEmail !== "riskalfadhilla215@gmail.com") {
    throw new ApiError(403, "Akses SUPER ADMIN tidak diizinkan");
  }

  // Kembalikan identitas agar Dashboard bisa memproses data
  return dbUser || { id: user.id, email: primaryEmail, role: "ADMIN", name: user.firstName };
}

export async function requireOperator(request: Request) {
  if (request.headers.has("x-api-key")) {
    const denied = cekKunciBot(request);
    if (denied) throw new ApiError(denied.status, "Kunci bot tidak valid");
    return "bot";
  }
  const admin = await requireAdmin();
  return admin.id;
}

export function apiError(error: unknown) {
  if (error instanceof ApiError) return NextResponse.json({ error: error.message }, { status: error.status });
  if (error instanceof ZodError || error instanceof SyntaxError) return NextResponse.json({ error: "Data tidak valid", details: error instanceof ZodError ? error.issues.map(i => i.message) : undefined }, { status: 400 });
  if (error && typeof error === "object" && "code" in error) {
    if (error.code === "P2002") return NextResponse.json({ error: "Data sudah ada. Muat ulang dan coba kembali." }, { status: 409 });
    if (error.code === "P2025") return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
  }
  console.error("API error", error);
  return NextResponse.json({ error: "Gagal memproses permintaan", msg: error instanceof Error ? error.message : String(error) }, { status: 500 });
}
