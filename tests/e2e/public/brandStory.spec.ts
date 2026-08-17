import { test, expect } from "@playwright/test";

test.describe("Public homepage — Brand Story flipbook", () => {
  test("renders the first spread with working arrow controls", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("CÂU CHUYỆN THƯƠNG HIỆU")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Copper Kettle/i })).toBeVisible();
    await expect(page.getByText("Trang 1 / 3")).toBeVisible();
    await expect(page.getByRole("button", { name: "Trang trước" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Trang sau" })).toBeEnabled();
  });

  test("flips to the next spread and back via the arrow controls", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Trang sau" }).click();
    await expect(page.getByText("Trang 2 / 3")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Hops & Malt/i })).toBeVisible();

    await page.getByRole("button", { name: "Trang trước" }).click();
    await expect(page.getByText("Trang 1 / 3")).toBeVisible();
  });

  test("disables the next arrow once the last spread is reached", async ({ page }) => {
    await page.goto("/");
    const next = page.getByRole("button", { name: "Trang sau" });

    await next.click();
    await next.click();

    await expect(page.getByText("Trang 3 / 3")).toBeVisible();
    await expect(next).toBeDisabled();
  });

  test("renders under the /en locale with English chrome copy", async ({ page }) => {
    await page.goto("/en");

    await expect(page.getByText("BRAND STORY")).toBeVisible();
    await expect(page.getByRole("button", { name: "Next page" })).toBeVisible();
  });

  test("plays a page-turn sound on arrow click, but not on page load", async ({ page }) => {
    // Stub the Web Audio API before any app code runs. Real audio can't be
    // observed from Playwright, but the graph being built and started can.
    await page.addInitScript(() => {
      const w = window as unknown as Record<string, unknown>;
      w.__audioStarts = 0;
      const param = () => ({ setValueAtTime() {}, exponentialRampToValueAtTime() {}, value: 0 });
      w.AudioContext = class {
        state = "running";
        currentTime = 0;
        sampleRate = 44100;
        destination = {};
        resume() {}
        createBuffer() {
          return { getChannelData: () => new Float32Array(1024) };
        }
        createBufferSource() {
          return {
            buffer: null,
            connect() {},
            stop() {},
            start() {
              (window as unknown as Record<string, number>).__audioStarts += 1;
            },
          };
        }
        createBiquadFilter() {
          return { type: "", Q: { value: 0 }, frequency: param(), connect() {} };
        }
        createGain() {
          return { gain: param(), connect() {} };
        }
      };
    });

    await page.goto("/");
    const startsBefore = await page.evaluate(
      () => (window as unknown as Record<string, number>).__audioStarts
    );
    expect(startsBefore).toBe(0);

    await page.getByRole("button", { name: "Trang sau" }).click();

    await expect
      .poll(() => page.evaluate(() => (window as unknown as Record<string, number>).__audioStarts))
      .toBeGreaterThan(0);
  });

  test("has no horizontal overflow at this viewport", async ({ page }) => {
    await page.goto("/");
    const hasOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasOverflow).toBe(false);
  });
});
