import { z } from "zod";
import type { ToolDef } from "./index";
import { registerTool } from "./index";

export const remindersCreateInput = z.object({ text: z.string().min(1), dueAt: z.string().optional() });
export const remindersCreateOutput = z.object({ id: z.string(), ok: z.boolean() });

const reminders_create: ToolDef = {
  name: "reminders_create",
  input: remindersCreateInput,
  output: remindersCreateOutput,
  async handler(args) {
    const input = remindersCreateInput.parse(args);
    const id = `rem_${Math.random().toString(36).slice(2)}`;
    return { id, ok: true };
  },
};

registerTool(reminders_create);

export { reminders_create };

