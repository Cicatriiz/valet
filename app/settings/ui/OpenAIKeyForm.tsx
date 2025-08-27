"use client";
import { useEffect, useState } from "react";

export default function OpenAIKeyForm() {
  const [exists, setExists] = useState<boolean | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/user/openai").then((r) => r.json()).then((d) => setExists(Boolean(d.exists))).catch(() => setExists(false));
  }, []);

  async function save() {
    setSaving(true);
    await fetch("/api/user/openai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ apiKey }) });
    setSaving(false);
    setApiKey("");
    setExists(true);
  }

  return (
    <div className="rounded border p-3 space-y-2">
      <div className="font-medium">OpenAI</div>
      <div className="text-sm text-gray-500">API key stored encrypted server-side</div>
      {exists ? (
        <div className="text-green-700 text-sm">Key saved</div>
      ) : (
        <div className="flex gap-2">
          <input type="password" className="flex-1 border rounded px-3 py-2" placeholder="sk-..." value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
          <button onClick={save} disabled={saving || apiKey.length < 20} className="px-3 py-2 rounded bg-black text-white text-sm">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      )}
    </div>
  );
}

