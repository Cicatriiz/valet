"use client";
import { useState } from "react";

export default function ApproveButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  async function onApprove() {
    setLoading(true);
    await fetch("/api/approvals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "approve" }) });
    setLoading(false);
    location.reload();
  }
  return (
    <button onClick={onApprove} disabled={loading} className="px-3 py-1 rounded bg-green-600 text-white text-sm">
      {loading ? "Approving…" : "Approve"}
    </button>
  );
}

