import { z } from "zod";

export const guestAction = z.discriminatedUnion("action", [
  z.object({ action: z.literal("start") }).strict(),
  z.object({ action: z.literal("end") }).strict(),
  z.object({ action: z.literal("message"), text: z.string().trim().min(1).max(2000), requestId: z.uuid() }).strict(),
  z.object({ action: z.literal("handoff"), requestId: z.uuid() }).strict(),
]);
export const adminAction = z.discriminatedUnion("action", [
  z.object({ action: z.literal("claim") }).strict(),
  z.object({ action: z.literal("release") }).strict(),
  z.object({ action: z.literal("message"), text: z.string().trim().min(1).max(2000), requestId: z.uuid() }).strict(),
]);
export type ChatView = {
  id: string; mode: "AI" | "WAITING" | "ADMIN"; version: number;
  pending: boolean; mine?: boolean; hasEarlier: boolean;
  messages: { id: string; sequence: number; role: "VISITOR" | "AI" | "ADMIN" | "SYSTEM"; content: string; createdAt: string }[];
};
export const modeLabel = { AI: "Asisten AI", WAITING: "Menunggu Admin", ADMIN: "Admin" };
