import { z } from "zod";
import type { ToolDef } from "./index";
import { registerTool } from "./index";
import { createPendingApproval } from "@/server/agent/approvals";
import { getCalendarClient } from "@/server/agent/services/google";

export const calendarListInput = z.object({ range: z.object({ start: z.string(), end: z.string() }) });
export const calendarListOutput = z.object({ events: z.array(z.object({ id: z.string(), title: z.string(), start: z.string(), end: z.string() })) });

export const calendarCreateInput = z.object({
  eventDraft: z.object({
    title: z.string(),
    start: z.string().datetime(),
    end: z.string().datetime(),
    attendees: z.array(z.string()).optional(),
  }),
});
export const calendarCreateOutput = z.object({ id: z.string(), created: z.boolean() });

export const calendarUpdateInput = z.object({ id: z.string(), diff: z.record(z.string(), z.any()) });
export const calendarUpdateOutput = z.object({ updated: z.boolean() });

const calendar_list: ToolDef = {
  name: "calendar_list",
  input: calendarListInput,
  output: calendarListOutput,
  async handler(args, ctx) {
    const input = calendarListInput.parse(args);
    if (!ctx.userId) return { events: [] };
    const cal = await getCalendarClient(ctx.userId);
    if (!cal) return { events: [] };
    const res = await cal.events.list({ calendarId: "primary", timeMin: input.range.start, timeMax: input.range.end, maxResults: 10, singleEvents: true, orderBy: "startTime" });
    const events = (res.data.items ?? []).map((e) => ({ id: e.id ?? "", title: e.summary ?? "(no title)", start: String(e.start?.dateTime ?? e.start?.date ?? ""), end: String(e.end?.dateTime ?? e.end?.date ?? "") }));
    return { events };
  },
};

const calendar_create: ToolDef = {
  name: "calendar_create",
  requiresApproval: true,
  input: calendarCreateInput,
  output: calendarCreateOutput,
  async handler(args, ctx) {
    const input = calendarCreateInput.parse(args);
    await createPendingApproval({
      userId: ctx.userId,
      toolName: "calendar_create",
      title: "Create Calendar Event",
      summary: `${input.eventDraft.title} (${input.eventDraft.start} → ${input.eventDraft.end})`,
      payload: input,
    });
    return { id: "", created: false };
  },
  async execute(args, ctx) {
    const input = calendarCreateInput.parse(args);
    if (!ctx.userId) throw new Error("Not authenticated");
    const cal = await getCalendarClient(ctx.userId);
    if (!cal) throw new Error("Google not connected");
    const res = await cal.events.insert({ calendarId: "primary", requestBody: { summary: input.eventDraft.title, start: { dateTime: input.eventDraft.start }, end: { dateTime: input.eventDraft.end }, attendees: (input.eventDraft.attendees ?? []).map((e) => ({ email: e })) } });
    return { id: res.data.id ?? "", created: true };
  },
};

const calendar_update: ToolDef = {
  name: "calendar_update",
  requiresApproval: true,
  input: calendarUpdateInput,
  output: calendarUpdateOutput,
  async handler(args, ctx) {
    const input = calendarUpdateInput.parse(args);
    await createPendingApproval({
      userId: ctx.userId,
      toolName: "calendar_update",
      title: "Update Calendar Event",
      summary: `Update event ${input.id}`,
      payload: input,
      diff: input.diff,
    });
    return { updated: false };
  },
};

registerTool(calendar_list);
registerTool(calendar_create);
registerTool(calendar_update);

export { calendar_list, calendar_create, calendar_update };

