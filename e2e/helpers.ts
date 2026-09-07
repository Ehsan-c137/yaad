import type { Page } from "@playwright/test";

import { expect } from "@playwright/test";

/**
 * Dismisses the first-run welcome modal so tests start from a clean,
 * onboarded state. Each Playwright test gets a fresh browser context, so the
 * modal always appears on a fresh page load.
 */
export async function dismissOnboarding(page: Page): Promise<void> {
  await page.goto("/");

  const skipButton = page.getByRole("button", { name: "Skip for now" });

  await skipButton.waitFor({ state: "visible", timeout: 15_000 });
  await skipButton.click();

  await expect(skipButton).toBeHidden();
}

/** Waits until the app has booted into the seeded default workspace. */
export async function waitForWorkspaceReady(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/workspace\/ws_personal/, {
    timeout: 15_000,
  });
  await expect(
    page.getByRole("heading", { name: "Personal Workspace" }),
  ).toBeVisible({ timeout: 15_000 });
}

/** Creates a page from the sidebar "+" button and opens it in the editor. */
export async function createPageFromSidebar(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Create new page" }).click();

  const pageItem = page
    .locator("[aria-label='Pages']")
    .getByRole("button", { name: "Untitled" })
    .first();

  await pageItem.waitFor({ state: "visible", timeout: 10_000 });
  await pageItem.click();

  await expect(page).toHaveURL(/\/workspace\/ws_personal\/page-/, {
    timeout: 10_000,
  });
}

/** Renames the open page through the editor title and waits for the sidebar. */
export async function renamePageTitle(
  page: Page,
  title: string,
): Promise<void> {
  const titleEditor = page.locator("[data-placeholder='Untitled']");

  await expect(titleEditor).toBeVisible({ timeout: 10_000 });

  await titleEditor.click();
  await page.keyboard.type(title);

  await expect(
    page.locator("[aria-label='Pages']").getByText(title),
  ).toBeVisible({ timeout: 10_000 });
}
