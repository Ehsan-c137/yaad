import { expect, test } from "@playwright/test";

test.describe("Onboarding (E2E)", () => {
  test("greets first-time visitors with the welcome modal", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.getByText("Welcome to Yaad")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByLabel("Your name")).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Skip for now" }),
    ).toBeVisible();
  });

  test("a submitted name is stored and the modal never shows again", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByLabel("Your name").fill("Ehsan");
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByText("Welcome to Yaad")).toBeHidden();

    await page.reload();

    await expect(page.getByText("Welcome to Yaad")).toBeHidden({
      timeout: 15_000,
    });
    await expect(page.getByText("Ehsan's Yaad")).toBeVisible({
      timeout: 15_000,
    });
  });

  test("skipping onboarding persists across reloads", async ({ page }) => {
    await page.goto("/");

    const skipButton = page.getByRole("button", { name: "Skip for now" });

    await skipButton.waitFor({ state: "visible", timeout: 15_000 });
    await skipButton.click();

    await expect(page.getByText("Welcome to Yaad")).toBeHidden();

    await page.reload();

    await expect(page.getByText("Welcome to Yaad")).toBeHidden({
      timeout: 15_000,
    });
  });
});
