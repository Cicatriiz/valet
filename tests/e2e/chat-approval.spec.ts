import { test, expect } from "@playwright/test";

test("chat shows user message bubble after sending", async ({ page }) => {
  await page.goto("/chat");
  const input = page.locator('input[placeholder="Ask Valet…"]');
  await input.waitFor({ state: "visible" });
  const prompt = "Please send an email to test@example.com";
  await input.fill(prompt);
  await page.getByRole("button", { name: "Send" }).click();
  // User message renders immediately; assert it appears
  await expect(page.getByTestId("msg").filter({ hasText: prompt })).toBeVisible({ timeout: 15000 });
});
