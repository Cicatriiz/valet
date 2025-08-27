import { test, expect } from "@playwright/test";

test("chat returns planned actions stub", async ({ page }) => {
  await page.goto("/chat");
  const input = page.locator('input[placeholder="Ask Valet…"]');
  await input.waitFor({ state: "visible" });
  await input.fill("Please send an email to test@example.com");
  await page.getByRole("button", { name: "Send" }).click();
  // Assert our progress message appears
  await expect(page.getByTestId("msg").filter({ hasText: "Sending…" })).toBeVisible({ timeout: 15000 });
});
