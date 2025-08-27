"use client";
import { useEffect, useRef, useState } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  async function send() {
    const text = inputRef.current?.value?.trim();
    if (!text) return;
    inputRef.current!.value = "";
    setMessages((m) => [...m, "Sending…"]);
    const res = await fetch("/api/agent", { method: "POST", body: JSON.stringify({ messages: [{ role: "user", content: text }] }) });
    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (reader) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const segments = buffer.split("\n\n");
      buffer = segments.pop() ?? ""; // keep partial
      for (const seg of segments) {
        const trimmed = seg.trim();
        if (!trimmed) continue;
        const line = trimmed.startsWith("data:") ? trimmed.slice(5).trim() : trimmed;
        try {
          const evt = JSON.parse(line);
          if (evt.type === "text") setMessages((m) => [...m, String(evt.data)]);
        } catch {
          // ignore malformed segment"
        }
      }
    }
  }

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div className="space-y-2">
        {messages.map((m, i) => (
          <div key={i} data-testid="msg" className="rounded border p-3 bg-white/5">
            {m}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input ref={inputRef} className="flex-1 border rounded px-3 py-2 bg-transparent" placeholder="Ask Valet…" />
        <button onClick={send} className="px-4 py-2 rounded bg-black text-white">Send</button>
      </div>
    </div>
  );
}

