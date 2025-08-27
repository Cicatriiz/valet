import { test, expect } from "@playwright/test";

test.skip("Settings shows Google connect UI", async ({ page }) => {
  await page.goto("/settings");
  await expect(page.getByText("Google")).toBeVisible();
  // Either Connect button or env warning must be visible
  const connectBtn = page.getByRole("button", { name: "Connect" });
  const envWarn = page.getByText("Missing GOOGLE_CLIENT_ID/SECRET");
  await expect(Promise.race([
    connectBtn.waitFor({ state: "visible" }),
    envWarn.waitFor({ state: "visible" }),
  ])).resolves.toBeDefined();
});


