import { z } from "zod";
import type { ToolDef } from "./index";
import { registerTool } from "./index";
import { upsertNote } from "@/server/agent/services/notion";

export const notesUpsertInput = z.object({ pageId: z.string().optional(), markdown: z.string().min(1) });
export const notesUpsertOutput = z.object({ pageId: z.string(), ok: z.boolean() });

const notes_upsert: ToolDef = {
  name: "notes_upsert",
  input: notesUpsertInput,
  output: notesUpsertOutput,
  async handler(args) {
    const input = notesUpsertInput.parse(args);
    const res = await upsertNote(input.pageId, input.markdown);
    return res;
  },
};

registerTool(notes_upsert);

export { notes_upsert };

