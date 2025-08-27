import { calendar_create } from "@/server/agent/tools/calendar";
import { describe, it, expect } from "vitest";

describe("calendar_create", () => {
  it("validates ISO8601 date strings", async () => {
    await expect(
      calendar_create.handler({ eventDraft: { title: "Meet", start: "not-a-date", end: "also-bad" } }, { userId: null })
    ).rejects.toThrow();
  });
});
