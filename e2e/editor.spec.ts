import { expect, test } from "@playwright/test";

import {
  createPageFromSidebar,
  dismissOnboarding,
  waitForWorkspaceReady,
} from "./helpers";

const PARAGRAPH_PLACEHOLDER = "Type '/' for commands...";

test.describe("Editor (E2E)", () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(45_000);

    await dismissOnboarding(page);
    await waitForWorkspaceReady(page);
    await createPageFromSidebar(page);
  });

  test("auto-creates an initial paragraph block on a new page", async ({
    page,
  }) => {
    await expect(
      page.locator(`[data-placeholder="${PARAGRAPH_PLACEHOLDER}"]`),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("typing updates the block content and the document state", async ({
    page,
  }) => {
    const paragraph = page.locator(
      `[data-placeholder="${PARAGRAPH_PLACEHOLDER}"]`,
    );

    await paragraph.click();
    await page.keyboard.type("Hello Yaad");

    await expect(paragraph).toContainText("Hello Yaad");
    await expect(
      page.getByText(/Inspect Current JSON State \(2 blocks\)/),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("Enter creates a sibling block", async ({ page }) => {
    const paragraph = page.locator(
      `[data-placeholder="${PARAGRAPH_PLACEHOLDER}"]`,
    );

    await paragraph.click();
    await page.keyboard.type("First block");
    await page.keyboard.press("Enter");

    await expect(
      page.locator(`[data-placeholder="${PARAGRAPH_PLACEHOLDER}"]`),
    ).toHaveCount(2, { timeout: 10_000 });
  });

  test("the slash menu turns a block into a heading", async ({ page }) => {
    const paragraph = page.locator(
      `[data-placeholder="${PARAGRAPH_PLACEHOLDER}"]`,
    );

    await paragraph.click();
    await page.keyboard.type("/");

    await expect(page.getByText("Basic blocks")).toBeVisible({
      timeout: 10_000,
    });

    await page.getByRole("button", { name: "Heading 1" }).click();

    await expect(page.locator("[data-placeholder='Heading 1']")).toBeVisible({
      timeout: 10_000,
    });
  });
});
