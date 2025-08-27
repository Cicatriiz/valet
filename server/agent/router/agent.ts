import { getTool, listTools } from "@/server/agent/tools";
import { SYSTEM_PROMPT, STYLE_PROMPT } from "@/server/llm/prompt";
import { getOpenAIForUser } from "@/server/llm/openai";
import { z } from "zod";

export const userMessageSchema = z.object({ role: z.literal("user"), content: z.string() });
export const assistantMessageSchema = z.object({ role: z.literal("assistant"), content: z.string().optional(), toolCalls: z.array(z.object({ name: z.string(), args: z.any() })).optional() });
export const messageSchema = z.union([userMessageSchema, assistantMessageSchema]);

export type ChatMessage = z.infer<typeof messageSchema>;

export async function* handleChat(messages: ChatMessage[], ctx: { userId: string | null; apiKey?: string | null }) {
  const openai = await getOpenAIForUser(ctx.userId, ctx.apiKey ?? undefined);
  if (openai) {
    // Use Responses API with full conversation history
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    const input = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "system", content: STYLE_PROMPT },
      ...messages.map((m) => ({ role: m.role, content: typeof m.content === "string" ? m.content : JSON.stringify(m.content) })),
    ];

    try {
      // The Responses API expects { model, input: { messages } }
      const resp: any = await openai.responses.create({
        model,
        input: { messages: input }
      });
      const text: string = resp.output_text ?? "";
      if (text) {
        yield { type: "text", data: text } as const;
        return;
      }
    } catch {
      // fall through to tools list on error
    }
  }

  // Fallback when no key or error
  const fallback = `Available tools: ${listTools().map((t) => t.name).join(", ")}`;
  yield { type: "text", data: fallback } as const;
}

export async function callToolByName(name: string, args: unknown, ctx: { userId: string | null }) {
  const tool = getTool(name);
  if (!tool) throw new Error(`Unknown tool: ${name}`);
  const result = await tool.handler(args, ctx);
  return result;
}

