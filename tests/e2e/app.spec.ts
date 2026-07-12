import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("landing page exposes command center and passes core accessibility checks", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "StadiumGPT AI" })).toBeVisible();
  await expect(page.getByRole("link", { name: /open command center/i })).toBeVisible();

  const accessibilityScanResults = await new AxeBuilder({ page })
    .disableRules(["color-contrast"])
    .analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
});

test("organizer dashboard and ai chat render", async ({ page }) => {
  await page.goto("/dashboard/organizer");
  await expect(page.getByRole("heading", { name: "Organizer Dashboard" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "StadiumGPT Assistant" })).toBeVisible();
});

