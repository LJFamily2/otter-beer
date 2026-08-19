import { test, expect } from "@playwright/test";

test.describe("Age Verification Gate E2E", () => {
  // Use unverified state for testing gate interactions
  test.use({
    storageState: { cookies: [], origins: [] },
  });

  test("displays age verification gate when unverified", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "ARE YOU 18+?" })
    ).toBeVisible();
  });

  test("clicking YES confirms age and unveils home page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "YES" }).click();
    await page.reload();

    // After clicking YES, dialog should vanish and site content becomes visible
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("clicking NO displays access restricted view", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "NO" }).click();

    await expect(
      page.getByRole("heading", { name: "ACCESS RESTRICTED" })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "LEARN MORE" })).toBeVisible();
    await expect(page.getByRole("link", { name: "LEAVE SITE" })).toBeVisible();
  });
});
