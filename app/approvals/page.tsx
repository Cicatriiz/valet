import prisma from "@/lib/db";
import ApproveButton from "./ui/ApproveButton";
import RejectButton from "./ui/RejectButton";

export default async function ApprovalsPage() {
  const approvals = await prisma.approval.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Approvals</h1>
      <div className="space-y-2">
        {approvals.map((a) => (
          <div key={a.id} className="rounded border p-3 space-y-2">
            <div className="text-sm text-gray-500">{a.status}</div>
            <div className="font-medium">{a.title}</div>
            <div className="text-sm">{a.summary}</div>
            {a.status === "pending" && (
              <div className="flex gap-2">
                <ApproveButton id={a.id} />
                <RejectButton id={a.id} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

