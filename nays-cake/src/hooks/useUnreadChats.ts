"use client";
import { useEffect, useState } from "react";
export function useUnreadChats() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let loading = false;
    const load = async () => {
      if (document.hidden || loading) return;
      loading = true;
      try {
        const response = await fetch("/api/admin/chats", { cache: "no-store", signal: controller.signal });
        if (response.ok) { const body = await response.json(); if (!controller.signal.aborted) setCount(body.unread || 0); }
      } catch { /* The existing inbox displays connection errors. */ }
      finally { loading = false; }
    };
    void load();
    const timer = setInterval(() => void load(), 15000);
    return () => { controller.abort(); clearInterval(timer); };
  }, []);
  return count;
}
