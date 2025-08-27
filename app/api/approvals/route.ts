import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import { approveAndExecuteApproval, rejectApproval } from "@/server/agent/approvals";
import { z } from "zod";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;
  const body = await req.json();
  const schema = z.object({ id: z.string(), action: z.enum(["approve", "reject"]), reason: z.string().optional() });
  const input = schema.parse(body);

  if (input.action === "approve") {
    const result = await approveAndExecuteApproval(input.id, userId);
    return Response.json({ ok: true, result });
  } else {
    await rejectApproval(input.id, userId, input.reason);
    return Response.json({ ok: true });
  }
}

