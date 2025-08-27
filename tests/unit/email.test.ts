import { email_draft } from "@/server/agent/tools/email";
import { describe, it, expect } from "vitest";

describe("email_draft", () => {
  it("rejects CRLF in subject", async () => {
    await expect(
      email_draft.handler({ to: "a@b.com", subject: "Hello\nWorld", html: "<p>Hi</p>" }, { userId: null })
    ).rejects.toThrow();
  });
  it("accepts valid subject", async () => {
    const res: any = await email_draft.handler({ to: "a@b.com", subject: "Hello", html: "<p>Hi</p>" }, { userId: null });
    expect(res.draftId).toBeTruthy();
  });
});
