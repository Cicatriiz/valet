import OpenAI from "openai";

export function getOpenAI() {
  if (process.env.USE_MOCK_LLM === "true") {
    return null as unknown as OpenAI; // mock in tests
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  return new OpenAI({ apiKey });
}

export type StreamChunk = {
  type: "text" | "tool_call" | "event";
  data: unknown;
};

