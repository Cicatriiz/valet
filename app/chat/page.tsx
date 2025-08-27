"use client";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="md:col-span-2">
        <CardContent className="space-y-2 p-4">
          {messages.map((m, i) => (
            <div key={i} data-testid="msg" className="max-w-[80%] rounded-2xl border p-3 bg-white dark:bg-white/10">
              {m}
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 space-y-2">
          <Input ref={inputRef} placeholder="Ask Valet…" />
          <button onClick={send} className="w-full px-4 py-2 rounded-md bg-black text-white">Send</button>
        </CardContent>
      </Card>
    </div>
  );
}

