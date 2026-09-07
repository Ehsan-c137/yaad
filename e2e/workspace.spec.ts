import { expect, test } from "@playwright/test";

import { dismissOnboarding, waitForWorkspaceReady } from "./helpers";

test.describe("Workspace management (E2E)", () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(45_000);

    await dismissOnboarding(page);
    await waitForWorkspaceReady(page);
  });

  test("creates and activates a new workspace from the switcher", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /Personal Workspace/ }).click();
    await page.getByRole("button", { name: "New Workspace" }).click();
    await page.getByLabel("Workspace name").fill("Work Stuff");
    await page.getByRole("button", { name: "Create", exact: true }).click();

    const workOption = page.getByRole("option", { name: /Work Stuff/ });

    await expect(workOption).toBeVisible({ timeout: 10_000 });
    await expect(workOption).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("[aria-label='Pages']")).toContainText(
      "No pages yet.",
    );
  });

  test("switches back to an existing workspace", async ({ page }) => {
    await page.getByRole("button", { name: /Personal Workspace/ }).click();
    await page.getByRole("button", { name: "New Workspace" }).click();
    await page.getByLabel("Workspace name").fill("Work Stuff");
    await page.getByRole("button", { name: "Create", exact: true }).click();

    await expect(
      page.getByRole("option", { name: /Work Stuff/ }),
    ).toHaveAttribute("aria-selected", "true", { timeout: 10_000 });

    await page.getByRole("option", { name: /Personal Workspace/ }).click();

    await expect(
      page.getByRole("heading", { name: "Personal Workspace" }),
    ).toBeVisible({ timeout: 10_000 });
  });
});
