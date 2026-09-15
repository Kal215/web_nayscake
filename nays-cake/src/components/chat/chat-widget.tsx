"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Headset, LogOut } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { modeLabel } from "@/lib/chat-contract";
import { ChatComposer, ChatThread } from "./chat-thread";

export function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const hidden = pathname.startsWith("/dashboard") || pathname.startsWith("/login");
  const chat = useChat(open && !hidden ? "/api/chat" : null, true);
  useEffect(() => { if (open) document.getElementById("chat-close")?.focus(); }, [open]);
  const close = () => { setOpen(false); button.current?.focus(); };
  if (hidden) return null;
  return <div className="chat-widget">
    {!open && <button ref={button} className="chat-launch neo-action neo-action--primary" onClick={() => setOpen(true)} aria-label="Buka chat Nay's Cake" title="Chat Nay's Cake" aria-expanded={false}><MessageCircle size={23} /><span>Chat</span></button>}
    {open && <section className="chat-panel" role="dialog" aria-modal="false" aria-labelledby="chat-heading" onKeyDown={e => { if (e.key === "Escape") { e.stopPropagation(); close(); } }}>
      <header className="chat-header">
        <div><h2 id="chat-heading">Chat Nay&apos;s Cake</h2><p>{chat.view ? modeLabel[chat.view.mode] : "Layanan pelanggan"}</p></div>
        {chat.view && <button className="chat-icon" disabled={chat.busy} aria-label="Akhiri sesi chat" title="Akhiri sesi chat" onClick={async () => { if (window.confirm("Akhiri sesi? Riwayat tidak lagi tersedia di browser ini. Admin tetap menyimpan riwayat hingga masa retensi berakhir.") && await chat.mutate("end")) close(); }}><LogOut size={18} /></button>}
        <button id="chat-close" className="chat-icon" onClick={close} aria-label="Tutup chat" title="Tutup chat"><X size={20} /></button>
      </header>
      <div className="chat-notice">Sesi chat berlaku 30 hari dan riwayat dapat dibaca admin.</div>
      <ChatThread view={chat.view} loading={chat.loading} error={chat.error} onEarlier={() => void chat.loadEarlier()} />
      {chat.view?.mode === "WAITING" && <p className="chat-status-note">Admin belum bergabung. Balasan mungkin tidak langsung tersedia.</p>}
      <div className="chat-tools">
        <button disabled={!chat.view || chat.busy || chat.view.mode !== "AI"} onClick={() => void chat.mutate("handoff")}><Headset size={16} />Hubungi Admin</button>
        <a href="https://wa.me/6285126023250" target="_blank" rel="noopener noreferrer">WhatsApp</a>
      </div>
      <ChatComposer disabled={!chat.view || !!chat.view.pending} busy={chat.busy} onSend={text => chat.mutate("message", text)} />
    </section>}
  </div>;
}
