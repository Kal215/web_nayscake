import { ZodError } from "zod";
import { ApiError } from "@/lib/api";
import { chatJSON } from "@/lib/chat-security";
export function chatFailure(error: unknown) {
  const status = error instanceof ApiError ? error.status : error instanceof ZodError || error instanceof SyntaxError ? 400 : 500;
  const message = error instanceof ApiError ? error.message : status === 400 ? "Data chat tidak valid." : "Chat sementara tidak tersedia. Coba lagi.";
  if (status === 500) console.error("Chat request failed", error && typeof error === "object" && "code" in error ? String(error.code) : "internal");
  const response = chatJSON({ error: message });
  // Keep the same no-store headers for errors and successful private responses.
  return new Response(response.body, { status, headers: response.headers });
}
