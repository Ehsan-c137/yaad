import { expect, test } from "@playwright/test";

import {
  createPageFromSidebar,
  dismissOnboarding,
  renamePageTitle,
  waitForWorkspaceReady,
} from "./helpers";

test.describe("Page management (E2E)", () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(45_000);

    await dismissOnboarding(page);
    await waitForWorkspaceReady(page);
  });

  test("creates a page, renames it, and reflects the change in the sidebar", async ({
    page,
  }) => {
    await createPageFromSidebar(page);
    await renamePageTitle(page, "My Test Page");

    await expect(
      page
        .locator("[aria-label='Pages']")
        .getByRole("button", { name: "My Test Page" }),
    ).toBeVisible();
  });

  test("creates a sub-page under an existing page", async ({ page }) => {
    await createPageFromSidebar(page);
    await renamePageTitle(page, "Parent Page");

    await page.getByRole("button", { name: "Add sub-page" }).click();

    await expect(
      page
        .locator("[aria-label='Pages']")
        .getByRole("button", { name: "Untitled" }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("moves a page to the trash and restores it", async ({ page }) => {
    await createPageFromSidebar(page);
    await renamePageTitle(page, "Trashed Page");

    await page.getByRole("button", { name: "Page options" }).click();
    await page.getByRole("button", { name: "Delete page" }).click();
    await page
      .getByRole("button", { name: "Move to trash", exact: true })
      .click();

    await expect(page.locator("[aria-label='Pages']")).toHaveCount(0);

    await page.getByRole("link", { name: "Go to Trash" }).click();

    await expect(page.getByRole("heading", { name: "Trash" })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("Trashed Page")).toBeVisible();

    await page.getByRole("button", { name: "Restore Trashed Page" }).click();

    await expect(
      page.locator("[aria-label='Pages']").getByText("Trashed Page"),
    ).toBeVisible({ timeout: 10_000 });
  });
});
