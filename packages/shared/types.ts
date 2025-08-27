import { z } from "zod";

export const ToolEnvelope = z.object({
  name: z.string(),
  requiresApproval: z.boolean().default(false),
  inputSchema: z.any(),
  outputSchema: z.any(),
});
export type ToolEnvelope = z.infer<typeof ToolEnvelope>;

export type ToolHandler = (args: unknown, ctx: { userId: string | null }) => Promise<unknown>;

export type PlannedAction = {
  id: string;
  tool: string;
  requiresApproval: boolean;
  input: unknown;
  summary: string;
};

