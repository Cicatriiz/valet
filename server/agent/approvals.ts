import prisma from "@/lib/db";
import { appendAuditLog } from "@/server/agent/audit";
import { getTool } from "@/server/agent/tools";

export async function createPendingApproval(input: {
  userId: string | null;
  toolName: string;
  title: string;
  summary: string;
  payload: unknown;
  diff?: unknown;
}) {
  const approval = await prisma.approval.create({
    data: {
      userId: input.userId ?? undefined,
      toolName: input.toolName,
      title: input.title,
      summary: input.summary,
      input: input.payload as any,
      diff: (input.diff as any) ?? undefined,
      status: "pending",
    },
  });
  return approval;
}

export async function markApprovalExecuted(id: string, result: unknown) {
  await prisma.approval.update({ where: { id }, data: { status: "executed", result: result as any } });
}

export async function approveAndExecuteApproval(approvalId: string, actorUserId: string | null) {
  const approval = await prisma.approval.findUnique({ where: { id: approvalId } });
  if (!approval) throw new Error("Approval not found");

  const tool = getTool(approval.toolName);
  if (!tool) {
    await prisma.approval.update({ where: { id: approvalId }, data: { status: "rejected" } });
    throw new Error("Tool not found for approval");
  }

  await prisma.approval.update({ where: { id: approvalId }, data: { status: "approved" } });

  let result: unknown = null;
  try {
    const args = approval.input as unknown;
    if (tool.execute) {
      result = await tool.execute(args, { userId: actorUserId });
    } else {
      result = await tool.handler(args, { userId: actorUserId });
    }
    await prisma.approval.update({ where: { id: approvalId }, data: { status: "executed", result: result as any } });
    await appendAuditLog({ userId: actorUserId ?? undefined, action: "approval_executed", entity: approval.toolName, data: { approvalId, result } });
  } catch (err: any) {
    await prisma.approval.update({ where: { id: approvalId }, data: { status: "rejected", result: { error: String(err?.message ?? err) } as any } });
    await appendAuditLog({ userId: actorUserId ?? undefined, action: "approval_failed", entity: approval.toolName, data: { approvalId, error: String(err?.message ?? err) } });
    throw err;
  }

  return result;
}

export async function rejectApproval(approvalId: string, actorUserId: string | null, reason?: string) {
  await prisma.approval.update({ where: { id: approvalId }, data: { status: "rejected", result: reason ? ({ reason } as any) : undefined } });
  await appendAuditLog({ userId: actorUserId ?? undefined, action: "approval_rejected", entity: approvalId, data: { reason } });
}

