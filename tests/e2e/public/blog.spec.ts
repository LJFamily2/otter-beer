import { test, expect } from "@playwright/test";

test.describe("Public blog", () => {
  test("blog list page renders the hero and header nav", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /otter beer/i })).toBeVisible();
  });

  test("homepage stays at the bare path (default locale has no prefix)", async ({
    page,
  }) => {
    await page.goto("/");
    expect(new URL(page.url()).pathname).toBe("/");
  });

  test("English blog list uses the /en prefix", async ({ page }) => {
    await page.goto("/en/blog");
    expect(new URL(page.url()).pathname).toBe("/en/blog");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("unknown post slug returns 404", async ({ page }) => {
    await page.goto("/blog/khong-ton-tai-slug-xyz");
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
  });

  test("blog list has no horizontal overflow at this viewport", async ({
    page,
  }) => {
    await page.goto("/blog");
    const hasOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth
    );
    expect(hasOverflow).toBe(false);
  });
});
