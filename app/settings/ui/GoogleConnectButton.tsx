"use client";
import { signIn } from "next-auth/react";

export default function GoogleConnectButton({ disabled = false }: { disabled?: boolean }) {
  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/settings" })}
      disabled={disabled}
      className="px-3 py-1 rounded bg-black text-white text-sm disabled:opacity-50"
    >
      Connect
    </button>
  );
}



