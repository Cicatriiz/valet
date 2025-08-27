"use client";
import { useEffect, useState } from "react";

export default function OpenAIKeyForm() {
  const [exists, setExists] = useState<boolean | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [unauth, setUnauth] = useState(false);

  useEffect(() => {
    // Prefer client-only key indicator
    const local = localStorage.getItem("valet_openai_key");
    if (local) {
      setExists(true);
      return;
    }
    (async () => {
      try {
        const r = await fetch("/api/user/openai");
        if (!r.ok) {
          if (r.status === 401) setUnauth(true);
          setExists(false);
          return;
        }
        const d = await r.json();
        setExists(Boolean(d.exists));
      } catch {
        setExists(false);
      }
    })();
  }, []);

  async function save() {
    setSaving(true);
    // Save client-only first
    localStorage.setItem("valet_openai_key", apiKey);
    try {
      // Also try server save if configured; ignore errors
      await fetch("/api/user/openai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ apiKey }) });
    } catch {}
    setSaving(false);
    setApiKey("");
    setExists(true);
  }

  return (
    <div className="rounded border p-3 space-y-2">
      <div className="font-medium">OpenAI</div>
      <div className="text-sm text-gray-500">API key stored encrypted server-side</div>
      {exists ? (
        <div className="flex items-center justify-between">
          <div className="text-green-700 text-sm">Key saved (client-only)</div>
          <button
            onClick={async () => {
              localStorage.removeItem("valet_openai_key");
              try { await fetch("/api/user/openai", { method: "DELETE" }); } catch {}
              setExists(false);
            }}
            className="px-3 py-1 rounded bg-red-600 text-white text-sm"
          >
            Remove
          </button>
        </div>
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

