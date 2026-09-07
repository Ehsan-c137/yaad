import { expect, test } from "@playwright/test";

import { dismissOnboarding, waitForWorkspaceReady } from "./helpers";

test.describe("App Smoke Test (E2E)", () => {
  test("loads the home page successfully", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/yaad/i);
  });

  test("redirects to the default workspace after initialization", async ({
    page,
  }) => {
    await dismissOnboarding(page);
    await waitForWorkspaceReady(page);
  });
});
