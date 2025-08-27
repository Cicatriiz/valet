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
      <div className="mt-6 rounded border p-4 space-y-2">
        <div className="font-medium">How to use</div>
        <ol className="list-decimal list-inside text-sm space-y-1">
          <li>Go to Settings → add your OpenAI key (or use mock mode)</li>
          <li>Open Chat and ask for help (e.g., “Summarize this…”)</li>
          <li>When Valet proposes an action, approve it in Approvals</li>
          <li>Review results and audit entries</li>
        </ol>
      </div>
    </div>
  );
}
