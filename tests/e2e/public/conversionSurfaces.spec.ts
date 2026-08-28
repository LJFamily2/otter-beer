import { test, expect } from "@playwright/test";

/**
 * Conversion surfaces from the pre-production checklist:
 *   item 2  — a call to action above the fold
 *   item 8  — a stated response time
 *   item 14 — directions, not just a map
 *
 * All three were missing or dead code. The hero was image-only with nothing to
 * act on until the contact block far below the fold; `copy.directions` and
 * `MAP_URL` both existed and nothing rendered either; and no response-time
 * promise appeared anywhere on the site.
 */

test.describe("above-the-fold CTA", () => {
  test("renders both hero CTAs on the homepage", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId("hero-cta-primary")).toBeVisible();
    await expect(page.getByTestId("hero-cta-secondary")).toBeVisible();
  });

  test("is genuinely above the fold, not merely present", async ({ page }) => {
    await page.goto("/");

    const box = await page.getByTestId("hero-cta-primary").boundingBox();
    const viewport = page.viewportSize();

    expect(box).not.toBeNull();
    expect(viewport).not.toBeNull();
    // Bottom edge inside the first screen, with no scrolling.
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(
      viewport?.height ?? 0
    );
  });

  test("primary CTA reaches the product showcase", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId("hero-cta-primary")).toHaveAttribute(
      "href",
      /#products$/
    );
  });

  test("secondary CTA navigates to the contact page", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("hero-cta-secondary").click();

    await expect(page).toHaveURL(/\/contact$/);
  });

  test("ships in the server HTML so a crawler sees the action too", async ({
    request,
  }) => {
    const html = await (await request.get("/")).text();
    const dom = html.replace(/<script[\s\S]*?<\/script>/gi, "");

    expect(dom).toContain('data-testid="hero-cta-primary"');
  });

  test("does not stop the carousel indicators working", async ({ page }) => {
    await page.goto("/");

    const indicators = page.getByRole("group", { name: "Hero slides" });
    await expect(indicators).toBeVisible();
    await indicators.getByRole("button").nth(1).click();

    await expect(page.getByText(/^Slide 2 of/)).toBeAttached();
  });
});

test.describe("contact conversion details", () => {
  test("states a response-time promise", async ({ page }) => {
    await page.goto("/contact");

    await expect(page.getByTestId("contact-response-time")).toBeVisible();
    await expect(page.getByTestId("contact-response-time")).toContainText(/24/);
  });

  test("renders a Get Directions link that nothing used to render", async ({
    page,
  }) => {
    await page.goto("/contact");

    const directions = page.getByTestId("contact-directions");
    await expect(directions).toBeVisible();
    await expect(directions).toHaveAttribute("href", /google\.com\/maps\/dir/);
  });

  test("directions point at coordinates, not a fuzzy address query", async ({
    page,
  }) => {
    await page.goto("/contact");

    await expect(page.getByTestId("contact-directions")).toHaveAttribute(
      "href",
      /destination=11\.3385,106\.1144/
    );
  });

  test("opens directions in a new tab without leaking the opener", async ({
    page,
  }) => {
    await page.goto("/contact");

    const directions = page.getByTestId("contact-directions");
    await expect(directions).toHaveAttribute("target", "_blank");
    await expect(directions).toHaveAttribute("rel", /noopener/);
  });

  test("visible GPS badge agrees with the Brewery JSON-LD geo node", async ({
    page,
    request,
  }) => {
    const html = await (await request.get("/contact")).text();
    const geo = /"latitude":\s*([\d.]+),\s*"longitude":\s*([\d.]+)/.exec(html);
    expect(geo).not.toBeNull();

    await page.goto("/contact");
    const badge = page.getByText(/°\s*[NB],/);

    await expect(badge).toContainText(geo?.[1] ?? "__no-latitude__");
    await expect(badge).toContainText(geo?.[2] ?? "__no-longitude__");
  });

  test("still keeps both phone numbers dialable", async ({ page }) => {
    await page.goto("/contact");

    await expect(page.locator('a[href="tel:+84908790102"]').first()).toBeVisible();
    await expect(page.locator('a[href="tel:+84981686491"]').first()).toBeVisible();
  });
});
