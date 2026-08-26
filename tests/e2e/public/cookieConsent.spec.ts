import { test, expect, type Page } from "@playwright/test";

/** Theme tokens from src/app/globals.css. */
const THEME = {
  primary: "rgb(0, 40, 103)", // --color-primary  #002867
  primaryContainer: "rgb(29, 63, 130)", // --color-primary-container #1d3f82
  onPrimary: "rgb(255, 255, 255)", // --color-on-primary #ffffff
  mahogany: "rgb(52, 16, 18)", // --color-mahogany #341012 (must NOT appear)
};

const CONSENT_KEY = "otter_beer_cookie_consent";

const banner = (page: Page) =>
  page.getByRole("region", { name: "Cookie consent" });

const readConsent = (page: Page) =>
  page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }, CONSENT_KEY);

test.describe("Cookie Consent E2E", () => {
  // The banner lives in the marketing layout; /privacy renders it without the
  // home page's data fetching, keeping these UI assertions fast and isolated.
  const PAGE = "/privacy";

  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE);
    // Age gate is pre-satisfied by the global storageState; only clear consent.
    await page.evaluate((key) => localStorage.removeItem(key), CONSENT_KEY);
    await page.reload();
    await expect(banner(page)).toBeVisible();
  });

  test("banner is visible on first visit with all three actions", async ({
    page,
  }) => {
    const region = banner(page);
    await expect(
      region.getByRole("heading", { name: /your privacy choice/i })
    ).toBeVisible();
    await expect(region.getByRole("button", { name: "Settings" })).toBeVisible();
    await expect(
      region.getByRole("button", { name: "Reject Non-Essential" })
    ).toBeVisible();
    await expect(
      region.getByRole("button", { name: "Accept All" })
    ).toBeVisible();
  });

  test("'Accept All' renders in the navy theme color, not mahogany red", async ({
    page,
  }) => {
    const acceptAll = banner(page).getByRole("button", { name: "Accept All" });

    const styles = await acceptAll.evaluate((el) => {
      const computed = getComputedStyle(el);
      return {
        background: computed.backgroundColor,
        color: computed.color,
      };
    });

    expect(styles.background).toBe(THEME.primary);
    expect(styles.background).not.toBe(THEME.mahogany);
    expect(styles.color).toBe(THEME.onPrimary);
  });

  test("'Accept All' hovers to the primary container shade", async ({
    page,
    isMobile,
  }) => {
    test.skip(!!isMobile, "hover states do not apply on touch devices");

    const acceptAll = banner(page).getByRole("button", { name: "Accept All" });
    await acceptAll.hover();

    await expect
      .poll(async () =>
        acceptAll.evaluate((el) => getComputedStyle(el).backgroundColor)
      )
      .toBe(THEME.primaryContainer);
  });

  test("secondary actions stay unfilled so 'Accept All' is the only solid CTA", async ({
    page,
  }) => {
    const region = banner(page);

    for (const name of ["Settings", "Reject Non-Essential"]) {
      const background = await region
        .getByRole("button", { name })
        .evaluate((el) => getComputedStyle(el).backgroundColor);

      expect(background).not.toBe(THEME.primary);
      expect(background).not.toBe(THEME.mahogany);
    }
  });

  test("the settings modal CTA matches the banner CTA color", async ({
    page,
  }) => {
    await banner(page).getByRole("button", { name: "Settings" }).click();

    const dialog = page.getByRole("dialog", { name: /cookie preferences/i });
    await expect(dialog).toBeVisible();

    const background = await dialog
      .getByRole("button", { name: "Save Preferences" })
      .evaluate((el) => getComputedStyle(el).backgroundColor);

    expect(background).toBe(THEME.primary);
  });

  test("'Accept All' persists full consent and dismisses the banner", async ({
    page,
  }) => {
    await banner(page).getByRole("button", { name: "Accept All" }).click();

    await expect(banner(page)).toBeHidden();
    expect(await readConsent(page)).toEqual({
      essential: true,
      analytics: true,
      marketing: true,
    });

    await page.reload();
    await expect(banner(page)).toBeHidden();
  });

  test("'Reject Non-Essential' persists essential-only consent", async ({
    page,
  }) => {
    await banner(page)
      .getByRole("button", { name: "Reject Non-Essential" })
      .click();

    await expect(banner(page)).toBeHidden();
    expect(await readConsent(page)).toEqual({
      essential: true,
      analytics: false,
      marketing: false,
    });
  });

  test("settings modal saves the toggled preferences", async ({ page }) => {
    await banner(page).getByRole("button", { name: "Settings" }).click();

    const dialog = page.getByRole("dialog", { name: /cookie preferences/i });
    await dialog.getByRole("checkbox", { name: "Analytics Cookies" }).uncheck();
    await dialog.getByRole("checkbox", { name: "Marketing Cookies" }).check();
    await dialog.getByRole("button", { name: "Save Preferences" }).click();

    await expect(dialog).toBeHidden();
    await expect(banner(page)).toBeHidden();
    expect(await readConsent(page)).toEqual({
      essential: true,
      analytics: false,
      marketing: true,
    });
  });

  test("cancelling the modal stores nothing and keeps the banner up", async ({
    page,
  }) => {
    await banner(page).getByRole("button", { name: "Settings" }).click();

    const dialog = page.getByRole("dialog", { name: /cookie preferences/i });
    await dialog.getByRole("button", { name: "Cancel" }).click();

    await expect(dialog).toBeHidden();
    await expect(banner(page)).toBeVisible();
    expect(await readConsent(page)).toBeNull();
  });

  test("banner controls are keyboard reachable with a visible focus ring", async ({
    page,
  }) => {
    const region = banner(page);
    const acceptAll = region.getByRole("button", { name: "Accept All" });

    // Tab from Settings → Reject → Accept All so the browser treats the focus
    // as keyboard-driven and :focus-visible applies.
    await region.getByRole("button", { name: "Settings" }).focus();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(acceptAll).toBeFocused();

    // `transition-colors` animates outline-color, so poll past the transition.
    await expect
      .poll(async () =>
        acceptAll.evaluate((el) => getComputedStyle(el).outlineColor)
      )
      .toBe(THEME.primary);

    const width = await acceptAll.evaluate(
      (el) => getComputedStyle(el).outlineWidth
    );
    expect(parseFloat(width)).toBeGreaterThan(0);

    await page.keyboard.press("Enter");
    await expect(banner(page)).toBeHidden();
  });
});
