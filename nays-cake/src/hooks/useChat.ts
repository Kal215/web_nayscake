"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatView } from "@/lib/chat-contract";

export function mergeChat(previous: ChatView | null, next: ChatView): ChatView {
  if (!previous || previous.id !== next.id) return next;
  const latest = next.version >= previous.version ? next : previous;
  const messages = [...new Map([...previous.messages, ...next.messages].map(m => [m.sequence, m])).values()].sort((a, b) => a.sequence - b.sequence);
  return { ...latest, messages, hasEarlier: (messages[0]?.sequence || 1) > 1 };
}
export function useChat(endpoint: string | null, startGuest = false) {
  const [view, setView] = useState<ChatView | null>(null);
  const [error, setError] = useState("");
  const [readError, setReadError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const generation = useRef(0);
  const sending = useRef(false);
  const pendingRetry = useRef<{ endpoint: string; text: string; action: string; requestId: string } | null>(null);
  const apply = useCallback((next: ChatView | null) => { if (next) setView(old => mergeChat(old, next)); }, []);
  useEffect(() => {
    const gen = ++generation.current;
    setView(null); setError(""); setReadError(""); setBusy(false); sending.current = false; pendingRetry.current = null;
    if (!endpoint) { setLoading(false); return; }
    let stopped = false;
    let inFlight = false;
    const controller = new AbortController();
    setLoading(true);
    const poll = async (initial = false) => {
      if (inFlight || (!initial && document.hidden)) return;
      inFlight = true;
      try {
        let response = await fetch(endpoint, { cache: "no-store", signal: controller.signal });
        let body = await response.json();
        if (!response.ok) throw new Error(body.error || "Tidak dapat memuat chat.");
        if (!body.conversation && startGuest && initial) {
          response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "start" }), signal: controller.signal });
          body = await response.json();
          if (!response.ok) throw new Error(body.error || "Tidak dapat memulai chat.");
        }
        if (!stopped && gen === generation.current) {
          if (!body.conversation) { setView(null); throw new Error("Sesi chat berakhir. Tutup lalu buka kembali."); }
          apply(body.conversation); setReadError("");
        }
      } catch (e) {
        if (!stopped && gen === generation.current) setReadError(e instanceof Error ? e.message : "Koneksi terputus.");
      } finally {
        inFlight = false;
        if (!stopped && gen === generation.current) setLoading(false);
      }
    };
    void poll(true);
    const interval = setInterval(() => void poll(), 5000);
    return () => { stopped = true; controller.abort(); clearInterval(interval); };
  }, [endpoint, startGuest, apply]);
  const mutate = async (action: string, text = "") => {
    if (!endpoint || sending.current) return false;
    const gen = generation.current;
    sending.current = true; setBusy(true); setError("");
    const old = pendingRetry.current;
    const requestId = old?.endpoint === endpoint && old.text === text && old.action === action ? old.requestId : crypto.randomUUID();
    if (action === "message" || action === "handoff") pendingRetry.current = { endpoint, action, text, requestId };
    try {
      const payload = action === "message" ? { action, text, requestId } : action === "handoff" ? { action, requestId } : { action };
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), signal: AbortSignal.timeout(30000) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Pesan belum berhasil dikirim.");
      if (gen === generation.current) { apply(body.conversation); pendingRetry.current = null; }
      return true;
    } catch (e) {
      if (gen === generation.current) setError(e instanceof Error ? e.message : "Pesan belum berhasil dikirim. Coba kembali.");
      return false;
    } finally {
      if (gen === generation.current) { sending.current = false; setBusy(false); }
    }
  };
  const loadEarlier = async () => {
    if (!endpoint || !view?.messages.length) return;
    const gen = generation.current;
    try {
      const response = await fetch(endpoint + "?before=" + view.messages[0].sequence, { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Tidak dapat memuat riwayat.");
      if (gen === generation.current) apply(body.conversation);
    } catch (e) { if (gen === generation.current) setError(e instanceof Error ? e.message : "Koneksi terputus."); }
  };
  return { view, error: error || readError, busy, loading, mutate, loadEarlier };
}
