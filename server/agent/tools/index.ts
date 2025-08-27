import { z } from "zod";
import type { ToolHandler } from "@/packages/shared/types";

export type ToolDef = {
  name: string;
  requiresApproval?: boolean;
  input: z.ZodTypeAny;
  output: z.ZodTypeAny;
  handler: ToolHandler;
  execute?: ToolHandler; // called after approval for irreversible actions
};

const registry = new Map<string, ToolDef>();

export function registerTool(def: ToolDef) {
  if (registry.has(def.name)) throw new Error(`Tool already registered: ${def.name}`);
  registry.set(def.name, def);
}

export function getTool(name: string): ToolDef | undefined {
  return registry.get(name);
}

export function listTools(): ToolDef[] {
  return Array.from(registry.values());
}

