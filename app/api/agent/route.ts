import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import { handleChat } from "@/server/agent/router/agent";
import "@/server/agent/services/register-tools";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;

  const { messages, apiKey } = await req.json();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      for await (const chunk of handleChat(messages, { userId, apiKey: apiKey ?? null })) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

