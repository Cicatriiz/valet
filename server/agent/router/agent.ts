import { getTool, listTools } from "@/server/agent/tools";
import { SYSTEM_PROMPT, STYLE_PROMPT } from "@/server/llm/prompt";
import { getOpenAIForUser } from "@/server/llm/openai";
import { z } from "zod";

export const userMessageSchema = z.object({ role: z.literal("user"), content: z.string() });
export const assistantMessageSchema = z.object({ role: z.literal("assistant"), content: z.string().optional(), toolCalls: z.array(z.object({ name: z.string(), args: z.any() })).optional() });
export const messageSchema = z.union([userMessageSchema, assistantMessageSchema]);

export type ChatMessage = z.infer<typeof messageSchema>;

export async function* handleChat(messages: ChatMessage[], ctx: { userId: string | null }) {
  const last = messages[messages.length - 1];
  const openai = await getOpenAIForUser(ctx.userId);

  // Minimal planner: if the user asks to send email, draft first and request approval on send
  if (last && last.role === "user") {
    const text = last.content.toLowerCase();
    if (text.includes("email") && text.includes("send")) {
      yield { type: "text", data: "Plan: draft email, then request approval to send." } as const;
      return;
    }
    if (text.includes("grocer") && (text.includes("buy") || text.includes("order"))) {
      yield { type: "text", data: "Plan: build groceries cart and await approval for checkout." } as const;
      return;
    }
  }

  const content = `Available tools: ${listTools().map((t) => t.name).join(", ")}`;
  yield { type: "text", data: content } as const;
}

export async function callToolByName(name: string, args: unknown, ctx: { userId: string | null }) {
  const tool = getTool(name);
  if (!tool) throw new Error(`Unknown tool: ${name}`);
  const result = await tool.handler(args, ctx);
  return result;
}

