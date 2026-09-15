import { createHash, createHmac, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api";

export const CHAT_COOKIE = process.env.NODE_ENV === "production" ? "__Host-nays_chat" : "nays_chat";
export const SESSION_SECONDS = 30 * 24 * 60 * 60;
export function newChatToken() { return randomBytes(32).toString("base64url"); }
export function tokenHash(token: string) { return createHash("sha256").update(token).digest("hex"); }
export function chatEnabled() {
  if (process.env.CHAT_ENABLED !== "true") throw new ApiError(503, "Chat belum tersedia. Silakan hubungi kami melalui WhatsApp.");
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin || request.headers.get("sec-fetch-site") === "cross-site") {
    throw new ApiError(403, "Asal permintaan tidak diizinkan");
  }
}
export async function boundedJSON(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new ApiError(415, "Gunakan JSON");
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, "Pesan kosong");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 8192) { await reader.cancel(); throw new ApiError(413, "Pesan terlalu panjang"); }
    chunks.push(value);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
export function requestToken(request: NextRequest) {
  const token = request.cookies.get(CHAT_COOKIE)?.value;
  return token && /^[A-Za-z0-9_-]{43}$/.test(token) ? token : null;
}
export function chatJSON(value: unknown, token?: string) {
  const response = NextResponse.json(value, { headers: { "Cache-Control": "private, no-store", "Vary": "Cookie" } });
  if (token !== undefined) response.cookies.set(CHAT_COOKIE, token, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: token ? SESSION_SECONDS : 0 });
  return response;
}
export async function rateLimit(key: string, limit: number, seconds: number) {
  const window = Math.floor(Date.now() / (seconds * 1000));
  const bucketKey = key + ":" + window;
  const expires = new Date((window + 1) * seconds * 1000);
  const rows = await prisma.$queryRaw<{ count: number }[]>`
    INSERT INTO "ChatRateBucket" ("key", "count", "expiresAt") VALUES (${bucketKey}, 1, ${expires})
    ON CONFLICT ("key") DO UPDATE SET "count" = "ChatRateBucket"."count" + 1 RETURNING "count"`;
  if (rows[0].count > limit) throw new ApiError(429, "Anda mengirim terlalu cepat. Silakan coba lagi sebentar.");
}
export function ipKey(request: Request) {
  const ip = process.env.VERCEL === "1" ? request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown" : "local";
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new ApiError(503, "Konfigurasi chat belum lengkap");
  return createHmac("sha256", secret).update(ip).digest("hex");
}
