import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api";
import { guestAction } from "@/lib/chat-contract";
import { boundedJSON, chatEnabled, chatJSON, ipKey, newChatToken, rateLimit, requestToken, sameOrigin, SESSION_SECONDS, tokenHash } from "@/lib/chat-security";
import { chatView, guestConversation, guestSend } from "@/lib/chat-store";
import { chatFailure } from "@/lib/chat-http";

export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  try {
    chatEnabled();
    await rateLimit("read:" + ipKey(request), 180, 60);
    const c = await guestConversation(requestToken(request));
    if (!c) return chatJSON({ conversation: null });
    const before = request.nextUrl.searchParams.get("before");
    return chatJSON({ conversation: await chatView(c.id, before ? z.coerce.number().int().min(1).max(1000).parse(before) : undefined) });
  } catch (e) { return chatFailure(e); }
}
export async function POST(request: NextRequest) {
  try {
    chatEnabled();
    sameOrigin(request);
    const action = guestAction.parse(await boundedJSON(request));
    const ip = ipKey(request);
    await rateLimit("write:" + ip, 40, 600);
    const c = await guestConversation(requestToken(request));
    if (action.action === "start") {
      if (c) return chatJSON({ conversation: await chatView(c.id) });
      await rateLimit("start:" + ip, 5, 3600);
      await prisma.chatRateBucket.deleteMany({ where: { expiresAt: { lt: new Date() } } });
      await prisma.chatConversation.deleteMany({ where: { expiresAt: { lt: new Date() } } });
      const token = newChatToken();
      const created = await prisma.chatConversation.create({
        data: { tokenHash: tokenHash(token), expiresAt: new Date(Date.now() + SESSION_SECONDS * 1000) },
      });
      return chatJSON({ conversation: await chatView(created.id) }, token);
    }
    if (!c) throw new ApiError(401, "Sesi chat berakhir. Tutup lalu buka chat untuk memulai kembali.");
    if (action.action === "end") {
      await prisma.chatConversation.update({ where: { id: c.id }, data: { tokenHash: tokenHash(newChatToken()) } });
      return chatJSON({ conversation: null }, "");
    }
    await rateLimit("conversation:" + c.id, 10, 60);
    await guestSend(c.id, action.action === "handoff" ? "Saya ingin berbicara dengan admin." : action.text, action.requestId, action.action === "handoff");
    return chatJSON({ conversation: await chatView(c.id) });
  } catch (e) { return chatFailure(e); }
}
