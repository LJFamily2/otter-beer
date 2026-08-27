import { test, expect } from "@playwright/test";

// The age gate renders its own <h1> until the verified-storage check clears it,
// so every heading assertion here matches by name — a bare `level: 1` locator
// races that overlay and measures the wrong element.
const BLOG_HEADING = /biên niên sử otter|the otter chronicles/i;

test.describe("Public blog", () => {
  test("blog list page renders the hero and header nav", async ({ page }) => {
    await page.goto("/blog");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /biên niên sử otter|the otter chronicles/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Otter Beer", exact: true })
    ).toBeVisible();
  });

  test("blog masthead shows the kicker above the heading", async ({ page }) => {
    await page.goto("/blog");
    const heading = page.getByRole("heading", {
      level: 1,
      name: BLOG_HEADING,
    });
    await expect(heading).toBeVisible();

    const kicker = page.getByText(/nhật ký nhà máy bia|the brewery journal/i);
    await expect(kicker).toBeVisible();

    // The kicker is an eyebrow — it has to sit above the h1, not below it.
    const kickerBox = await kicker.boundingBox();
    const headingBox = await heading.boundingBox();
    expect(kickerBox!.y).toBeLessThan(headingBox!.y);
  });

  test("blog heading uses the tightened masthead type, not stretched", async ({
    page,
  }) => {
    await page.goto("/blog");
    const heading = page.getByRole("heading", {
      level: 1,
      name: BLOG_HEADING,
    });
    await expect(heading).toBeVisible();

    const styles = await heading.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        fontSize: parseFloat(s.fontSize),
        lineHeight: parseFloat(s.lineHeight),
        letterSpacing: parseFloat(s.letterSpacing),
      };
    });
    // leading-[0.92] and tracking-[-0.03em] are what turn the plain centered
    // title into a masthead block; guard both against a regression.
    expect(styles.lineHeight / styles.fontSize).toBeLessThan(1);
    expect(styles.letterSpacing).toBeLessThan(0);
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
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /the otter chronicles|biên niên sử otter/i,
      })
    ).toBeVisible();
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

  test("blog top kicker sits below fixed header with sufficient padding", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/blog");
    const kicker = page.getByText(/nhật ký nhà máy bia|the brewery journal/i);
    await expect(kicker).toBeVisible();
    const kickerBox = await kicker.boundingBox();
    // Desktop fixed header height is ~88px; top padding ensures kicker starts below 88px.
    expect(kickerBox!.y).toBeGreaterThanOrEqual(88);
  });

  test("footer on blog page renders Facebook and Instagram social links", async ({
    page,
  }) => {
    await page.goto("/blog");
    const footer = page.getByRole("contentinfo");
    const fbLink = footer.getByRole("link", { name: "Facebook" });
    const igLink = footer.getByRole("link", { name: "Instagram" });

    await expect(fbLink).toBeVisible();
    await expect(igLink).toBeVisible();
    await expect(fbLink).toHaveAttribute("href", /facebook\.com/);
    await expect(igLink).toHaveAttribute("href", /instagram\.com/);
  });
});
