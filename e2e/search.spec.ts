import { expect, test } from "@playwright/test";

import {
  createPageFromSidebar,
  dismissOnboarding,
  renamePageTitle,
  waitForWorkspaceReady,
} from "./helpers";

test.describe("Command palette search (E2E)", () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(45_000);

    await dismissOnboarding(page);
    await waitForWorkspaceReady(page);
  });

  test("finds pages by title and navigates to them", async ({ page }) => {
    await createPageFromSidebar(page);
    await renamePageTitle(page, "Findable Page");

    await page.keyboard.press("ControlOrMeta+K");

    const input = page.getByPlaceholder("Search pages or type a command...");

    await expect(input).toBeVisible({ timeout: 10_000 });

    await input.fill("findable");

    const result = page.getByRole("option", { name: /Findable Page/ });

    await expect(result).toBeVisible({ timeout: 10_000 });

    await result.click();

    await expect(page).toHaveURL(/\/workspace\/ws_personal\/page-/);
    await expect(
      page
        .getByRole("tablist", { name: "Open document tabs" })
        .getByRole("tab"),
    ).toContainText("Findable Page", { timeout: 10_000 });
  });

  test("shows an empty state for unknown queries", async ({ page }) => {
    await page.keyboard.press("ControlOrMeta+K");

    const input = page.getByPlaceholder("Search pages or type a command...");

    await expect(input).toBeVisible({ timeout: 10_000 });

    await input.fill("zzz-no-match");

    await expect(page.getByText(/No pages found for/)).toBeVisible({
      timeout: 10_000,
    });
  });
});
