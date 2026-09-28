import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireOperator } from "@/lib/api";
import { appendMessage } from "@/lib/chat-store";
import { boundedJSON } from "@/lib/chat-security";
import { prisma } from "@/lib/prisma";

const payloadSchema = z.object({
  id: z.string(),
  text: z.string()
});

export async function POST(request: NextRequest) {
  try {
    await requireOperator(request);
    const body = payloadSchema.parse(await boundedJSON(request));
    
    await prisma.$transaction(async tx => {
      const c = await tx.chatConversation.findUnique({ where: { id: body.id } });
      if (!c) throw new Error("Conversation not found");
      await appendMessage(tx, c, "ADMIN", body.text, null, { mode: "WAITING", aiJobId: null, aiStartedAt: null });
    });
    
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("M2M Error:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
