"use client";
import { useState } from "react";

export default function RejectButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  async function onReject() {
    setLoading(true);
    await fetch("/api/approvals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "reject" }) });
    setLoading(false);
    location.reload();
  }
  return (
    <button onClick={onReject} disabled={loading} className="px-3 py-1 rounded bg-red-600 text-white text-sm">
      {loading ? "Rejecting…" : "Reject"}
    </button>
  );
}

