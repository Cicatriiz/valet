import prisma from "@/lib/db";
import ApproveButton from "./ui/ApproveButton";
import RejectButton from "./ui/RejectButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Badge from "@/components/ui/badge";

export default async function ApprovalsPage() {
  const approvals = await prisma.approval.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Approvals</h1>
      <div className="grid gap-3 md:grid-cols-2">
        {approvals.map((a) => (
          <Card key={a.id}>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>{a.title}</CardTitle>
              <Badge variant={a.status === "pending" ? "warning" : a.status === "executed" ? "success" : a.status === "rejected" ? "destructive" : "default"}>{a.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-gray-600 dark:text-gray-300">{a.summary}</div>
              {a.status === "pending" && (
                <div className="flex gap-2">
                  <ApproveButton id={a.id} />
                  <RejectButton id={a.id} />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

