"use client";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Msg = { id: string; role: "user" | "assistant"; text: string; ts: number };
type Chat = { id: string; title: string; createdAt: number; updatedAt: number };

function loadChats(): Chat[] {
  try { return JSON.parse(localStorage.getItem("valet_chats") || "[]"); } catch { return []; }
}
function saveChats(chats: Chat[]) { localStorage.setItem("valet_chats", JSON.stringify(chats)); }
function loadMessages(chatId: string): Msg[] {
  try { return JSON.parse(localStorage.getItem(`valet_chat_${chatId}`) || "[]"); } catch { return []; }
}
function saveMessages(chatId: string, msgs: Msg[]) {
  localStorage.setItem(`valet_chat_${chatId}`, JSON.stringify(msgs));
}

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cs = loadChats();
    if (cs.length === 0) {
      const id = crypto.randomUUID();
      const now = Date.now();
      const nc: Chat = { id, title: "New chat", createdAt: now, updatedAt: now };
      saveChats([nc]);
      setChats([nc]);
      setSelectedId(id);
      saveMessages(id, []);
      setMessages([]);
    } else {
      setChats(cs);
      const sid = localStorage.getItem("valet_selected_chat") || cs[0].id;
      setSelectedId(sid);
      setMessages(loadMessages(sid));
    }
  }, []);

  useEffect(() => { if (selectedId) localStorage.setItem("valet_selected_chat", selectedId); }, [selectedId]);
  useEffect(() => { inputRef.current?.focus(); }, [selectedId]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  function selectChat(id: string) {
    setSelectedId(id);
    setMessages(loadMessages(id));
  }
  function newChat() {
    const id = crypto.randomUUID();
    const nc: Chat = { id, title: "New chat", createdAt: Date.now(), updatedAt: Date.now() };
    const next = [nc, ...chats];
    setChats(next); saveChats(next);
    saveMessages(id, []);
    selectChat(id);
  }
  function renameChat(id: string) {
    const name = prompt("Rename chat", chats.find(c => c.id === id)?.title || "");
    if (!name) return;
    const next = chats.map(c => c.id === id ? { ...c, title: name, updatedAt: Date.now() } : c);
    setChats(next); saveChats(next);
  }
  function deleteChat(id: string) {
    const next = chats.filter(c => c.id !== id);
    setChats(next); saveChats(next);
    localStorage.removeItem(`valet_chat_${id}`);
    if (selectedId === id) {
      if (next.length) selectChat(next[0].id); else { setSelectedId(null); setMessages([]); }
    }
  }

  async function send() {
    if (!selectedId) return;
    const text = (inputRef.current?.value ?? input).trim();
    if (!text) return;
    inputRef.current && (inputRef.current.value = ""); setInput("");
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", text: text, ts: Date.now() };
    const mNext = [...messages, userMsg]; setMessages(mNext); saveMessages(selectedId, mNext);
    // bump chat timestamp and maybe title
    const titled = text.length > 3 ? text.slice(0, 40) : "New chat";
    const chatsNext = chats.map(c => c.id === selectedId ? { ...c, title: c.title === "New chat" ? titled : c.title, updatedAt: Date.now() } : c);
    setChats(chatsNext); saveChats(chatsNext);

    setLoading(true);
    const key = localStorage.getItem("valet_openai_key");
    const payload = {
      messages: mNext.map((m) => ({ role: m.role, content: m.text })),
      apiKey: key,
    };
    const res = await fetch("/api/agent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const reader = res.body?.getReader(); const decoder = new TextDecoder(); let buffer = ""; let assistantId: string | null = null;
    while (reader) {
      const { value, done } = await reader.read(); if (done) break;
      buffer += decoder.decode(value, { stream: true }); const segments = buffer.split("\n\n"); buffer = segments.pop() ?? "";
      for (const seg of segments) {
        const line = seg.trim(); if (!line.startsWith("data:")) continue; const json = line.slice(5).trim();
        try {
          const evt = JSON.parse(json);
          if (evt.type === "text") {
            const chunk = String(evt.data);
            setMessages((m) => {
              const next = [...m];
              if (!assistantId) { assistantId = crypto.randomUUID(); next.push({ id: assistantId, role: "assistant", text: chunk, ts: Date.now() }); }
              else { const idx = next.findIndex(x => x.id === assistantId); if (idx >= 0) next[idx] = { ...next[idx], text: next[idx].text + chunk }; else next.push({ id: assistantId, role: "assistant", text: chunk, ts: Date.now() }); }
              saveMessages(selectedId, next); return next;
            });
          }
        } catch {}
      }
    }
    setLoading(false);
  }

  return (
    <div className="grid gap-4 md:grid-cols-12">
      <Card className="md:col-span-3">
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-medium">Chats</div>
            <button onClick={newChat} className="text-xs underline">New</button>
          </div>
          <div className="max-h-[70vh] overflow-auto space-y-1">
            {chats.map((c) => (
              <div key={c.id} className={`group rounded-lg border p-2 cursor-pointer ${selectedId === c.id ? "bg-black text-white" : "hover:bg-gray-50 dark:hover:bg-white/10"}`} onClick={() => selectChat(c.id)}>
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate text-sm">{c.title || "Untitled"}</div>
                  <div className="opacity-0 group-hover:opacity-100 flex gap-2 text-xs">
                    <button onClick={(e) => { e.stopPropagation(); renameChat(c.id); }} className="underline">Rename</button>
                    <button onClick={(e) => { e.stopPropagation(); deleteChat(c.id); }} className="underline text-red-600">Delete</button>
                  </div>
                </div>
                <div className="text-[10px] opacity-60">{new Date(c.updatedAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="md:col-span-9">
        <CardContent className="space-y-2 p-4">
          <div className="max-h-[60vh] overflow-auto space-y-2">
            {messages.map((m) => (
              <div key={m.id} data-testid="msg" className={`animate-in max-w-[80%] rounded-2xl border p-3 ${m.role === "user" ? "ml-auto bg-black text-white" : "bg-white dark:bg-white/10"}`}>
                <div className="text-xs opacity-60 mb-1">{new Date(m.ts).toLocaleTimeString()}</div>
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="inline-flex items-center gap-2 rounded-2xl border p-3 bg-white dark:bg-white/10">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                <span>Sending…</span>
              </div>
            )}
            <div ref={endRef} />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm opacity-60">{selectedId ? chats.find(c => c.id === selectedId)?.title : "No chat selected"}</div>
            <button onClick={() => { if (selectedId) { saveMessages(selectedId, []); setMessages([]); } }} className="text-xs underline">Clear messages</button>
          </div>
          <Input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }} placeholder="Ask Valet…" />
          <button onClick={send} className="w-full px-4 py-2 rounded-md bg-black text-white">Send</button>
        </CardContent>
      </Card>
    </div>
  );
}

