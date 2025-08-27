export default function Home() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Valet</h1>
      <p className="text-sm text-gray-500">Secure AI assistant for email, calendar, notes, reminders, and groceries.</p>
      <div className="flex gap-3">
        <a className="underline" href="/chat">Open Chat</a>
        <a className="underline" href="/approvals">Approvals</a>
        <a className="underline" href="/tasks">Tasks</a>
      </div>
    </div>
  );
}
