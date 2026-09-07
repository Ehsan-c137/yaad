import { expect, test } from "@playwright/test";

import {
  createPageFromSidebar,
  dismissOnboarding,
  renamePageTitle,
  waitForWorkspaceReady,
} from "./helpers";

test.describe("Document tabs (E2E)", () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60_000);

    await dismissOnboarding(page);
    await waitForWorkspaceReady(page);
  });

  test("opening pages builds up tabs and closing returns to the previous tab", async ({
    page,
  }) => {
    await createPageFromSidebar(page);
    await renamePageTitle(page, "Alpha Page");

    await page.getByRole("button", { name: "New tab" }).click();
    await renamePageTitle(page, "Beta Page");

    const tablist = page.getByRole("tablist", {
      name: "Open document tabs",
    });

    await expect(tablist.getByRole("tab", { name: /Alpha Page/ })).toBeVisible({
      timeout: 10_000,
    });
    await expect(tablist.getByRole("tab", { name: /Beta Page/ })).toBeVisible();
    await expect(tablist.getByRole("tab")).toHaveCount(2);

    await tablist
      .getByRole("tab", { name: /Beta Page/ })
      .getByLabel("Close tab")
      .click();

    await expect(tablist.getByRole("tab")).toHaveCount(1, { timeout: 10_000 });
    await expect(
      tablist.getByRole("tab", { name: /Alpha Page/ }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/workspace\/ws_personal\/page-/);
  });
});
