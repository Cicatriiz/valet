import OpenAI from "openai";
import prisma from "@/lib/db";
// @ts-ignore prisma types can lag after migration in dev
import { decryptFromString } from "@/lib/crypto";
import { cookies } from "next/headers";

export function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null as unknown as OpenAI;
  return new OpenAI({ apiKey });
}

export async function getOpenAIForUser(userId: string | null, providedKey?: string | null) {
  if (providedKey && providedKey.trim().length > 0) {
    return new OpenAI({ apiKey: providedKey.trim() });
  }
  // Prefer explicit user or cookie keys regardless of USE_MOCK_LLM
  if (userId) {
    const secret = await (prisma as any).secret.findUnique({ where: { userId_key: { userId, key: "OPENAI_API_KEY" } } });
    if (secret) {
      const apiKey = decryptFromString(secret.value);
      return new OpenAI({ apiKey });
    }
  }
  try {
    const cookieStore = await cookies();
    const c = cookieStore.get("valet_openai")?.value;
    if (c) {
      const apiKey = c.startsWith("plain:") ? c.slice(6) : decryptFromString(c);
      return new OpenAI({ apiKey });
    }
  } catch {}
  // If mocking is explicitly enabled and no user/cookie key found, return null
  if (process.env.USE_MOCK_LLM === "true") return null as unknown as OpenAI;
  const fallbackKey = process.env.OPENAI_API_KEY;
  if (!fallbackKey) return null as unknown as OpenAI;
  return new OpenAI({ apiKey: fallbackKey });
}

export type StreamChunk = {
  type: "text" | "tool_call" | "event";
  data: unknown;
};

