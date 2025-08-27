import prisma from "@/lib/db";

export default async function TasksPage() {
  const tasks = await prisma.task.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Tasks</h1>
      <div className="space-y-2">
        {tasks.map((t) => (
          <div key={t.id} className="rounded border p-3">
            <div className="font-medium">{t.text}</div>
            <div className="text-sm text-gray-500">{t.dueAt ? new Date(t.dueAt).toLocaleString() : "No due date"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

