"use client";
import { useEffect, useRef, useState } from "react";
import { Send, LoaderCircle, ChevronUp } from "lucide-react";
import type { ChatView } from "@/lib/chat-contract";

function MessageText({ content }: { content: string }) {
  return <>{content.split(/(https:\/\/[^\s]+)/g).map((part, i) => part.startsWith("https://") ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="underline break-all">{part}</a> : part)}</>;
}
export function ChatThread({ view, loading, error, onEarlier }: { view: ChatView | null; loading: boolean; error: string; onEarlier: () => void }) {
  const scroll = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const last = view?.messages.at(-1)?.sequence;
  useEffect(() => { if (stick.current && scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight; }, [last, view?.pending]);
  return <>
    <div ref={scroll} className="chat-thread" role="log" aria-label="Riwayat percakapan" aria-live="polite" onScroll={e => { const el = e.currentTarget; stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 100; }}>
      {view?.hasEarlier && <button type="button" className="chat-earlier" onClick={onEarlier}><ChevronUp size={16} />Pesan sebelumnya</button>}
      {loading && <p className="chat-empty" role="status">Memuat percakapan...</p>}
      {!loading && view && !view.messages.length && <p className="chat-empty">Halo, ada yang ingin ditanyakan tentang Nay&apos;s Cake?</p>}
      {view?.messages.map(message => <div key={message.id} className={"chat-message chat-message--" + message.role.toLowerCase()}>
        <div className="chat-message-label">{({ VISITOR: "Pelanggan", AI: "Asisten AI", ADMIN: "Admin", SYSTEM: "Sistem" })[message.role]}<time dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</time></div>
        <p><MessageText content={message.content} /></p>
      </div>)}
      {view?.pending && <p className="chat-pending" role="status"><LoaderCircle size={14} className="animate-spin" />Asisten sedang menjawab...</p>}
    </div>
    {error && <p className="chat-error" role="alert">{error}</p>}
  </>;
}
export function ChatComposer({ disabled, busy, onSend }: { disabled: boolean; busy: boolean; onSend: (text: string) => Promise<boolean> }) {
  const [draft, setDraft] = useState("");
  return <form className="chat-composer" onSubmit={async e => { e.preventDefault(); const text = draft.trim(); if (text && !disabled && !busy && await onSend(text)) setDraft(""); }}>
    <label className="sr-only" htmlFor="chat-message-input">Tulis pesan</label>
    <textarea id="chat-message-input" value={draft} onChange={e => setDraft(e.target.value)} maxLength={2000} rows={2} placeholder="Tulis pesan..." disabled={disabled || busy}
      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); e.currentTarget.form?.requestSubmit(); } }} />
    <button className="neo-action neo-action--primary chat-icon" type="submit" disabled={disabled || busy || !draft.trim()} aria-label="Kirim pesan" title="Kirim pesan">{busy ? <LoaderCircle size={19} className="animate-spin" /> : <Send size={19} />}</button>
  </form>;
}
