"use client";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Headset, Bot, MessageCircle, RefreshCw } from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ChatComposer, ChatThread } from "@/components/chat/chat-thread";
import { useChat } from "@/hooks/useChat";
import { modeLabel, type ChatView } from "@/lib/chat-contract";

type InboxItem = { id: string; mode: ChatView["mode"]; updatedAt: string; preview: string; unread: boolean };
export default function ChatDashboard() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [unread, setUnread] = useState(0);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const chat = useChat(selected ? "/api/admin/chats/" + encodeURIComponent(selected) : null);
  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch("/api/admin/chats?mode=" + filter + "&page=" + page, { cache: "no-store", signal });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Gagal memuat inbox");
      setItems(body.conversations); setHasMore(body.hasMore); setUnread(body.unread); setError(""); setLoaded(true);
    } catch (e) { if (!signal?.aborted) { setError(e instanceof Error ? e.message : "Koneksi terputus"); setLoaded(true); } }
  }, [filter, page]);
  useEffect(() => {
    const controller = new AbortController();
    setLoaded(false);
    void load(controller.signal);
    const timer = setInterval(() => { if (!document.hidden) void load(controller.signal); }, 5000);
    return () => { controller.abort(); clearInterval(timer); };
  }, [load]);
  return <Sidebar>
    <div className="chat-admin-title"><div><h1>Chat Pelanggan</h1><p>{unread} percakapan belum dibaca</p></div><button className="neo-action chat-icon" aria-label="Muat ulang inbox" title="Muat ulang inbox" onClick={() => void load()}><RefreshCw size={20} /></button></div>
    {error && <p className="chat-error" role="alert">{error}</p>}
    <div className={"chat-inbox " + (selected ? "chat-inbox--selected" : "")}>
      <aside className="chat-inbox-list">
        <label className="sr-only" htmlFor="chat-filter">Filter percakapan</label>
        <select id="chat-filter" value={filter} onChange={e => { setFilter(e.target.value); setPage(0); }} className="neo-control chat-filter">
          <option value="ALL">Semua percakapan</option><option value="WAITING">Menunggu admin</option><option value="ADMIN">Ditangani admin</option><option value="AI">Asisten AI</option>
        </select>
        <div className="chat-inbox-scroll">
          {!loaded && <p className="chat-empty">Memuat inbox...</p>}
          {loaded && !items.length && !error && <p className="chat-empty">Belum ada percakapan.</p>}
          {items.map(item => <button key={item.id} className={"chat-inbox-item " + (item.id === selected ? "is-selected" : "")} onClick={() => setSelected(item.id)} aria-current={item.id === selected ? "true" : undefined}>
            <div><strong>Tamu {item.id.slice(-6)}</strong>{item.unread && <span className="chat-unread-dot" aria-label="Belum dibaca" />}</div>
            <p>{item.preview}</p><small>{modeLabel[item.mode]} <span>{new Date(item.updatedAt).toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" })}</span></small>
          </button>)}
        </div>
        <div className="chat-inbox-pages">
          <button className="chat-icon" disabled={page === 0} onClick={() => setPage(p => p - 1)} title="Halaman sebelumnya" aria-label="Halaman sebelumnya"><ChevronLeft size={18} /></button>
          <span>{page + 1}</span>
          <button className="chat-icon" disabled={!hasMore} onClick={() => setPage(p => p + 1)} title="Halaman berikutnya" aria-label="Halaman berikutnya"><ChevronRight size={18} /></button>
        </div>
      </aside>
      <section className="chat-admin-conversation" aria-label="Percakapan pelanggan">
        {!selected ? <div className="chat-no-selection"><MessageCircle size={32} /><p>Pilih percakapan</p></div> : <>
          <header className="chat-header">
            <button className="chat-icon chat-back" aria-label="Kembali ke inbox" title="Kembali ke inbox" onClick={() => setSelected(null)}><ArrowLeft size={20} /></button>
            <div><h2>Tamu {selected.slice(-6)}</h2><p>{chat.view ? modeLabel[chat.view.mode] : "Memuat..."}</p></div>
            {chat.view && (chat.view.mode === "ADMIN" && chat.view.mine ?
              <button className="neo-action chat-takeover" disabled={chat.busy} onClick={() => void chat.mutate("release")}><Bot size={17} />Aktifkan AI</button> :
              <button className="neo-action chat-takeover" disabled={chat.busy || chat.view.mode === "ADMIN"} onClick={() => void chat.mutate("claim")}><Headset size={17} />{chat.view.mode === "ADMIN" ? "Admin lain" : "Ambil alih"}</button>)}
          </header>
          <ChatThread view={chat.view} loading={chat.loading} error={chat.error} onEarlier={() => void chat.loadEarlier()} />
          <ChatComposer key={selected} disabled={!chat.view?.mine || chat.view.mode !== "ADMIN"} busy={chat.busy} onSend={text => chat.mutate("message", text)} />
        </>}
      </section>
    </div>
  </Sidebar>;
}
