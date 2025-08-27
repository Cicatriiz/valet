import prisma from "@/lib/db";
import Link from "next/link";

export default async function SettingsPage() {
  const accounts = await prisma.account.findMany({ where: { provider: "google" }, take: 1 });
  const googleConnected = accounts.length > 0;
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Settings</h1>
      <div className="space-y-2">
        <div className="flex items-center justify-between rounded border p-3">
          <div>
            <div className="font-medium">Google</div>
            <div className="text-sm text-gray-500">Used for Gmail and Calendar</div>
          </div>
          {googleConnected ? (
            <span className="text-green-700 text-sm">Connected</span>
          ) : (
            <Link href="/api/auth/signin" className="px-3 py-1 rounded bg-black text-white text-sm">Connect</Link>
          )}
        </div>
      </div>
    </div>
  );
}

