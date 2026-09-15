import { ChatConversation, ChatRole, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api";
import { answerChat, HANDOFF_REPLY } from "@/lib/chat-ai";
import { tokenHash } from "@/lib/chat-security";

type Tx = Prisma.TransactionClient;
export async function guestConversation(token: string | null) {
  if (!token) return null;
  return prisma.chatConversation.findFirst({ where: { tokenHash: tokenHash(token), expiresAt: { gt: new Date() } } });
}
async function current(tx: Tx, id: string) {
  const c = await tx.chatConversation.findUnique({ where: { id } });
  if (!c || c.expiresAt <= new Date()) throw new ApiError(404, "Percakapan berakhir. Mulai chat baru.");
  return c;
}
// CAS and message insertion share one transaction: a losing writer leaves no message.
export async function appendMessage(tx: Tx, c: ChatConversation, role: ChatRole, content: string, requestId: string | null, data: Prisma.ChatConversationUpdateManyMutationInput = {}) {
  const changed = await tx.chatConversation.updateMany({
    where: { id: c.id, version: c.version },
    data: { ...data, version: { increment: 1 }, messageCount: { increment: 1 }, ...(role === "VISITOR" ? { visitorSequence: c.messageCount + 1 } : {}) },
  });
  if (!changed.count) throw new ApiError(409, "Percakapan berubah. Coba kirim kembali.");
  return tx.chatMessage.create({ data: { conversationId: c.id, sequence: c.messageCount + 1, role, content, requestId } });
}
export async function recoverChat(id: string) {
  await prisma.$transaction(async tx => {
    const c = await current(tx, id);
    if (!c.aiJobId || !c.aiStartedAt || Date.now() - c.aiStartedAt.getTime() < 45000) return;
    const changed = await tx.chatConversation.updateMany({
      where: { id, version: c.version, aiJobId: c.aiJobId, mode: "AI" },
      data: { mode: "WAITING", aiJobId: null, aiStartedAt: null, version: { increment: 1 }, messageCount: { increment: 1 } },
    });
    if (changed.count) await tx.chatMessage.create({ data: { conversationId: id, sequence: c.messageCount + 1, role: "SYSTEM", content: HANDOFF_REPLY.content } });
  });
}
export async function chatView(id: string, before?: number, adminId?: string) {
  await recoverChat(id);
  const c = await prisma.chatConversation.findUniqueOrThrow({ where: { id } });
  const messages = await prisma.chatMessage.findMany({
    where: { conversationId: id, ...(before ? { sequence: { lt: before } } : {}) },
    orderBy: { sequence: "desc" }, take: 100,
    select: { id: true, sequence: true, role: true, content: true, createdAt: true },
  });
  if (adminId && !before) await prisma.chatConversation.updateMany({ where: { id, version: c.version }, data: { adminReadSequence: c.visitorSequence, updatedAt: c.updatedAt } });
  return { id, mode: c.mode, version: c.version, pending: !!c.aiJobId, ...(adminId ? { mine: c.assigneeId === adminId } : {}), hasEarlier: (messages.at(-1)?.sequence || 1) > 1, messages: messages.reverse() };
}
export async function guestSend(id: string, text: string, requestId: string, handoff = false) {
  await recoverChat(id);
  const job = await prisma.$transaction(async tx => {
    const c = await current(tx, id);
    const existing = await tx.chatMessage.findUnique({ where: { conversationId_requestId: { conversationId: id, requestId } } });
    if (existing) {
      if (existing.role !== "VISITOR" || existing.content !== text) throw new ApiError(409, "ID pengiriman sudah digunakan untuk pesan lain.");
      return null;
    }
    if (!handoff && c.aiJobId) throw new ApiError(409, "Tunggu balasan sebelumnya atau pilih Hubungi Admin.");
    if (c.messageCount >= 300) throw new ApiError(409, "Batas percakapan tercapai. Silakan hubungi WhatsApp toko.");
    const useAI = c.mode === "AI" && !handoff;
    const jobId = useAI ? requestId : null;
    await appendMessage(tx, c, "VISITOR", text, requestId, {
      ...(handoff && c.mode !== "ADMIN" ? { mode: "WAITING" } : {}),
      aiJobId: jobId, aiStartedAt: jobId ? new Date() : null,
    });
    return jobId;
  });
  if (!job) return;
  const history = await prisma.chatMessage.findMany({ where: { conversationId: id }, orderBy: { sequence: "desc" }, take: 6, select: { role: true, content: true } });
  const reply = await answerChat(history.reverse());
  await prisma.$transaction(async tx => {
    const c = await current(tx, id);
    // An admin takeover or visitor handoff invalidates the in-flight AI answer.
    if (c.mode !== "AI" || c.aiJobId !== job) return;
    await appendMessage(tx, c, reply.handoff ? "SYSTEM" : "AI", reply.content, null, { aiJobId: null, aiStartedAt: null, ...(reply.handoff ? { mode: "WAITING" } : {}) });
  });
}
export async function adminChange(id: string, adminId: string, action: { action: "claim" | "release" | "message"; text?: string; requestId?: string }) {
  await prisma.$transaction(async tx => {
    const c = await current(tx, id);
    if (action.action === "message") {
      const replay = await tx.chatMessage.findUnique({ where: { conversationId_requestId: { conversationId: id, requestId: action.requestId! } } });
      if (replay) {
        if (replay.role !== "ADMIN" || replay.content !== action.text) throw new ApiError(409, "ID pengiriman sudah digunakan untuk pesan lain.");
        return;
      }
      if (c.mode !== "ADMIN" || c.assigneeId !== adminId) throw new ApiError(409, "Ambil alih percakapan sebelum membalas.");
      if (c.messageCount >= 350) throw new ApiError(409, "Batas percakapan tercapai.");
      await appendMessage(tx, c, "ADMIN", action.text!, action.requestId!, { adminReadSequence: c.visitorSequence });
      return;
    }
    if (c.mode === "ADMIN" && c.assigneeId !== adminId) throw new ApiError(409, "Percakapan sedang ditangani admin lain.");
    if (action.action === "claim" && c.assigneeId === adminId && c.mode === "ADMIN") return;
    if (action.action === "release" && c.mode !== "ADMIN") throw new ApiError(409, "Percakapan belum Anda ambil alih.");
    await appendMessage(tx, c, "SYSTEM", action.action === "claim" ? "Admin telah bergabung dalam percakapan." : "Admin mengembalikan percakapan ke asisten AI.", null, {
      mode: action.action === "claim" ? "ADMIN" : "AI",
      assigneeId: action.action === "claim" ? adminId : null,
      aiJobId: null, aiStartedAt: null, adminReadSequence: c.visitorSequence,
    });
  });
}
