import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api";
import { adminAction } from "@/lib/chat-contract";
import { boundedJSON, chatEnabled, chatJSON, rateLimit, sameOrigin } from "@/lib/chat-security";
import { adminChange, chatView } from "@/lib/chat-store";
import { chatFailure } from "@/lib/chat-http";
type Context = { params: Promise<{ id: string }> };
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest, context: Context) {
  try {
    const admin = await requireAdmin();
    chatEnabled();
    const { id } = await context.params;
    const before = request.nextUrl.searchParams.get("before");
    return chatJSON({ conversation: await chatView(id, before ? z.coerce.number().int().min(1).max(1000).parse(before) : undefined, admin.id) });
  } catch (e) { return chatFailure(e); }
}
export async function POST(request: NextRequest, context: Context) {
  try {
    const admin = await requireAdmin();
    chatEnabled();
    sameOrigin(request);
    const action = adminAction.parse(await boundedJSON(request));
    await rateLimit("admin:" + admin.id, 60, 60);
    const { id } = await context.params;
    await adminChange(id, admin.id, action);
    return chatJSON({ conversation: await chatView(id, undefined, admin.id) });
  } catch (e) { return chatFailure(e); }
}
