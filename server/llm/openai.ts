import OpenAI from "openai";
import prisma from "@/lib/db";
// @ts-ignore prisma types can lag after migration in dev
import { decryptFromString } from "@/lib/crypto";

export function getOpenAI() {
  if (process.env.USE_MOCK_LLM === "true") {
    return null as unknown as OpenAI; // mock in tests
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  return new OpenAI({ apiKey });
}

export async function getOpenAIForUser(userId: string | null) {
  if (process.env.USE_MOCK_LLM === "true") return null as unknown as OpenAI;
  if (userId) {
    const secret = await (prisma as any).secret.findUnique({ where: { userId_key: { userId, key: "OPENAI_API_KEY" } } });
    if (secret) {
      const apiKey = decryptFromString(secret.value);
      return new OpenAI({ apiKey });
    }
  }
  const fallbackKey = process.env.OPENAI_API_KEY;
  if (!fallbackKey) return null as unknown as OpenAI;
  return new OpenAI({ apiKey: fallbackKey });
}

export type StreamChunk = {
  type: "text" | "tool_call" | "event";
  data: unknown;
};

