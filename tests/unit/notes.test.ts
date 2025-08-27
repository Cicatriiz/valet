import { notes_upsert } from "@/server/agent/tools/notes";
import { describe, it, expect } from "vitest";

describe("notes_upsert", () => {
  it("returns a pageId and ok true", async () => {
    const res: any = await notes_upsert.handler({ markdown: "Hello" }, { userId: null });
    expect(res.pageId).toBeTruthy();
    expect(res.ok).toBe(true);
  });
});

