import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import Link from "next/link";
import GoogleConnectButton from "./ui/GoogleConnectButton";
import OpenAIKeyForm from "./ui/OpenAIKeyForm";

export default async function SettingsPage() {
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;
  const googleConnected = userId
    ? (await prisma.account.count({ where: { provider: "google", userId } })) > 0
    : (await prisma.account.count({ where: { provider: "google" } })) > 0;
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Settings</h1>
      <div className="space-y-4">
        <div className="rounded border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Google</div>
              <div className="text-sm text-gray-500">Gmail + Calendar tools</div>
            </div>
            {!googleEnabled ? (
              <span className="text-xs text-red-600">Missing GOOGLE_CLIENT_ID/SECRET</span>
            ) : googleConnected ? (
              <span className="text-green-700 text-sm">Connected</span>
            ) : (
              <GoogleConnectButton />
            )}
          </div>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
            <li>List recent emails: <code>email_list</code></li>
            <li>Draft email (server or local): <code>email_draft</code></li>
            <li>Send email (requires approval): <code>email_send</code></li>
            <li>List calendar events in a range: <code>calendar_list</code></li>
            <li>Create event (requires approval): <code>calendar_create</code></li>
            <li>Update event (requires approval): <code>calendar_update</code></li>
          </ul>
          <div className="text-xs text-gray-500">Scopes: Gmail modify, Calendar. Revoke access anytime in your Google Account. If clicking Connect errors, verify GOOGLE_CLIENT_ID/SECRET are set and callback URL matches your site: /api/auth/callback/google.</div>
        </div>

        <OpenAIKeyForm />
      </div>
    </div>
  );
}

