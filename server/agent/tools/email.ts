import { z } from "zod";
import type { ToolDef } from "./index";
import { registerTool } from "./index";
import { createPendingApproval } from "@/server/agent/approvals";
import { getGmailClient } from "@/server/agent/services/google";

export const emailListInput = z.object({ label: z.string().optional(), query: z.string().optional() });
export const emailListOutput = z.object({ emails: z.array(z.object({ id: z.string(), from: z.string(), subject: z.string(), snippet: z.string() })) });

export const emailDraftInput = z.object({
  to: z.string().email(),
  subject: z
    .string()
    .min(1)
    .refine((s) => !/[\r\n]/.test(s), { message: "Subject must not contain CRLF" }),
  html: z.string().min(1),
});
export const emailDraftOutput = z.object({ draftId: z.string(), to: z.string(), subject: z.string() });

export const emailSendInput = z.object({ draftId: z.string() });
export const emailSendOutput = z.object({ sent: z.boolean(), id: z.string().optional() });

const email_list: ToolDef = {
  name: "email_list",
  input: emailListInput,
  output: emailListOutput,
  async handler(args, ctx) {
    const input = emailListInput.parse(args);
    if (!ctx.userId) return { emails: [] };
    const gmail = await getGmailClient(ctx.userId);
    if (!gmail) return { emails: [] };
    const list = await gmail.users.messages.list({
      userId: "me",
      maxResults: 5,
      q: input.query ?? undefined,
      labelIds: input.label ? [input.label] : undefined,
    });
    const messages = await Promise.all(
      (list.data.messages ?? []).map(async (m) => {
        const id = m.id!;
        const res = await gmail.users.messages.get({ userId: "me", id, format: "metadata", metadataHeaders: ["From", "Subject"] });
        const headers = res.data.payload?.headers ?? [];
        const from = headers.find((h) => h.name === "From")?.value ?? "";
        const subject = headers.find((h) => h.name === "Subject")?.value ?? "";
        const snippet = res.data.snippet ?? "";
        return { id, from, subject, snippet };
      })
    );
    return { emails: messages };
  },
};

const email_draft: ToolDef = {
  name: "email_draft",
  input: emailDraftInput,
  output: emailDraftOutput,
  async handler(args, ctx) {
    const input = emailDraftInput.parse(args);
    const draftId = `draft_${Math.random().toString(36).slice(2)}`;
    if (ctx.userId) {
      const gmail = await getGmailClient(ctx.userId);
      if (gmail) {
        const raw = toBase64Url(
          [
            `To: ${input.to}`,
            `Subject: ${input.subject}`,
            "Content-Type: text/html; charset=UTF-8",
            "",
            input.html,
          ].join("\r\n")
        );
        const res = await gmail.users.drafts.create({ userId: "me", requestBody: { message: { raw } } });
        return { draftId: res.data.id ?? draftId, to: input.to, subject: input.subject };
      }
    }
    return { draftId, to: input.to, subject: input.subject };
  },
};

const email_send: ToolDef = {
  name: "email_send",
  requiresApproval: true,
  input: emailSendInput,
  output: emailSendOutput,
  async handler(args, ctx) {
    const input = emailSendInput.parse(args);
    await createPendingApproval({
      userId: ctx.userId,
      toolName: "email_send",
      title: "Send Email",
      summary: `Send email for draft ${input.draftId}`,
      payload: input,
    });
    return { sent: false };
  },
  async execute(args, ctx) {
    const input = emailSendInput.parse(args);
    if (!ctx.userId) throw new Error("Not authenticated");
    const gmail = await getGmailClient(ctx.userId);
    if (!gmail) throw new Error("Google not connected");
    const res = await gmail.users.drafts.send({ userId: "me", requestBody: { id: input.draftId } });
    return { sent: true, id: String(res.data.id ?? "") };
  },
};

registerTool(email_list);
registerTool(email_draft);
registerTool(email_send);

export { email_list, email_draft, email_send };

function toBase64Url(str: string): string {
  return Buffer.from(str, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

