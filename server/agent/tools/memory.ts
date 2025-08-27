import { z } from "zod";
import type { ToolDef } from "./index";
import { registerTool } from "./index";
import prisma from "@/lib/db";

export const memoryWriteInput = z.object({ key: z.string().min(1), val: z.any() });
export const memoryWriteOutput = z.object({ ok: z.boolean() });

export const memoryReadInput = z.object({ key: z.string().min(1) });
export const memoryReadOutput = z.object({ value: z.any().nullable() });

const memory_write: ToolDef = {
  name: "memory_write",
  input: memoryWriteInput,
  output: memoryWriteOutput,
  async handler(args, ctx) {
    const input = memoryWriteInput.parse(args);
    if (!ctx.userId) throw new Error("Not authenticated");
    await prisma.memory.upsert({
      where: { userId_key: { userId: ctx.userId, key: input.key } },
      create: { userId: ctx.userId, key: input.key, value: input.val as any },
      update: { value: input.val as any },
    });
    return { ok: true };
  },
};

const memory_read: ToolDef = {
  name: "memory_read",
  input: memoryReadInput,
  output: memoryReadOutput,
  async handler(args, ctx) {
    const input = memoryReadInput.parse(args);
    if (!ctx.userId) throw new Error("Not authenticated");
    const mem = await prisma.memory.findUnique({ where: { userId_key: { userId: ctx.userId, key: input.key } } });
    return { value: mem?.value ?? null };
  },
};

registerTool(memory_write);
registerTool(memory_read);

export { memory_write, memory_read };

