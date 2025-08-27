import prisma from "@/lib/db";

export async function appendAuditLog(input: {
  userId?: string | null;
  action: string;
  message?: string;
  entity?: string;
  data?: unknown;
}) {
  await prisma.auditLog.create({
    data: {
      userId: input.userId ?? undefined,
      action: input.action,
      message: input.message,
      entity: input.entity,
      data: (input.data as any) ?? undefined,
    },
  });
}

export async function logToolRun(toolName: string, userId: string | null, phase: "plan" | "execute" | "error", payload?: unknown) {
  await appendAuditLog({ userId: userId ?? undefined, action: `tool_${phase}`, entity: toolName, data: payload });
}

