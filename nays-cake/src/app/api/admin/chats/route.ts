import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api";
import { chatEnabled, chatJSON } from "@/lib/chat-security";
import { chatFailure } from "@/lib/chat-http";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    chatEnabled();
    const page = z.coerce.number().int().min(0).max(1000).parse(request.nextUrl.searchParams.get("page") || 0);
    const mode = z.enum(["ALL", "WAITING", "ADMIN", "AI"]).parse(request.nextUrl.searchParams.get("mode") || "ALL");
    const active = { expiresAt: { gt: new Date() } };
    const [rows, unread] = await Promise.all([
      prisma.chatConversation.findMany({
        where: { ...active, ...(mode === "ALL" ? {} : { mode }) },
        orderBy: [{ updatedAt: "desc" }, { id: "desc" }], take: 31, skip: page * 30,
        select: { id: true, mode: true, visitorSequence: true, adminReadSequence: true, updatedAt: true,
          messages: { take: 1, orderBy: { sequence: "desc" }, select: { content: true } } },
      }),
      prisma.chatConversation.count({ where: { ...active, visitorSequence: { gt: prisma.chatConversation.fields.adminReadSequence } } }),
    ]);
    return chatJSON({ conversations: rows.slice(0, 30).map(c => ({
      id: c.id, mode: c.mode, updatedAt: c.updatedAt, unread: c.visitorSequence > c.adminReadSequence,
      preview: c.messages[0]?.content.slice(0, 140) || "Percakapan baru",
    })), unread, hasMore: rows.length > 30 });
  } catch (e) { return chatFailure(e); }
}
