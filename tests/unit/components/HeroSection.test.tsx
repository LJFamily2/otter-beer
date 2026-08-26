import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HeroSection } from "@/components/sections/HeroSection";
import { setPrefersReducedMotion } from "../../support/matchMedia";

const SLIDE_COUNT = 4;
const DWELL_MS = 6000;

function setTabHidden(hidden: boolean) {
  Object.defineProperty(document, "hidden", {
    writable: true,
    configurable: true,
    value: hidden,
  });
  act(() => {
    document.dispatchEvent(new Event("visibilitychange"));
  });
}

/** The live region is the component's own statement of which slide is current. */
function currentSlideNumber() {
  const region = screen.getByText(/^Slide \d+ of \d+:/);
  return Number(/^Slide (\d+) of/.exec(region.textContent ?? "")?.[1]);
}

function indicators() {
  return within(screen.getByRole("group", { name: "Hero slides" })).getAllByRole(
    "button"
  );
}

describe("HeroSection Component", () => {
  beforeEach(() => {
    setPrefersReducedMotion(false);
    setTabHidden(false);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("structure", () => {
    it("renders one indicator button per slide", () => {
      render(<HeroSection />);
      expect(indicators()).toHaveLength(SLIDE_COUNT);
    });

    it("does not render previous/next arrow controls", () => {
      render(<HeroSection />);

      expect(
        screen.queryByRole("button", { name: /previous slide/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /next slide/i })
      ).not.toBeInTheDocument();
    });

    it("mounts the neighbouring slides so the next image is preloaded", () => {
      render(<HeroSection />);

      // Window is [last, first, second] on the opening frame. Matched on a
      // substring so the assertion is about which slides are mounted, not
      // about the exact wording of the (SEO-tuned) alt copy.
      expect(screen.getByAltText(/dòng bia chủ lực/i)).toBeInTheDocument();
      expect(screen.getByAltText(/Premium Lager/i)).toBeInTheDocument();
      expect(screen.getByAltText(/hoa bia Saaz/i)).toBeInTheDocument();
    });

    it("gives every slide alt text that names the brand", () => {
      const { container } = render(<HeroSection />);

      // Queried by tag, not by role: the whole slide stage is aria-hidden
      // (the live region announces the current slide instead), so these <img>
      // elements expose no `img` role. Alt text is still what image search and
      // answer engines read off this section, and a slide whose alt omits the
      // brand is invisible to both.
      const images = container.querySelectorAll("img");
      expect(images.length).toBeGreaterThan(0);
      for (const image of images) {
        expect(image.getAttribute("alt")).toMatch(/Otter Beer/i);
      }
    });

    it("renders the page's single h1 naming the brand and the place", () => {
      render(<HeroSection locale="vi" />);

      const headings = screen.getAllByRole("heading", { level: 1 });
      expect(headings).toHaveLength(1);
      expect(headings[0]).toHaveTextContent(/Otter Beer/i);
      expect(headings[0]).toHaveTextContent(/Tây Ninh/i);
    });

    it("renders the English heading for the en locale", () => {
      render(<HeroSection locale="en" />);

      expect(
        screen.getByRole("heading", { level: 1, name: /Otter Beer craft brewery/i })
      ).toBeInTheDocument();
    });

    it("keeps the hero image-only — the heading is not painted on the slides", () => {
      // The design is deliberately photography with no type over it. The h1
      // still has to exist for crawlers and screen readers, so it is sr-only;
      // if it ever renders visibly again, that is a design regression.
      render(<HeroSection locale="vi" />);

      expect(screen.getByRole("heading", { level: 1 })).toHaveClass("sr-only");
    });

    it("exposes the current slide through aria-current and a live region", () => {
      render(<HeroSection />);

      expect(currentSlideNumber()).toBe(1);
      expect(indicators()[0]).toHaveAttribute("aria-current", "true");
      expect(indicators()[1]).not.toHaveAttribute("aria-current");
    });

    it("does not present itself as a tablist", () => {
      render(<HeroSection />);

      expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
      expect(screen.queryAllByRole("tab")).toHaveLength(0);
    });
  });

  describe("indicator navigation", () => {
    it("jumps to the clicked slide", async () => {
      const user = userEvent.setup();
      render(<HeroSection />);

      await user.click(indicators()[2]);

      expect(currentSlideNumber()).toBe(3);
      expect(indicators()[2]).toHaveAttribute("aria-current", "true");
      expect(indicators()[0]).not.toHaveAttribute("aria-current");
    });

    it("moves between slides with the arrow keys", async () => {
      const user = userEvent.setup();
      render(<HeroSection />);

      await user.click(indicators()[0]);
      await user.keyboard("{ArrowRight}");
      expect(currentSlideNumber()).toBe(2);

      await user.keyboard("{ArrowLeft}");
      expect(currentSlideNumber()).toBe(1);
    });

    it("wraps backwards from the first slide to the last", async () => {
      const user = userEvent.setup();
      render(<HeroSection />);

      await user.click(indicators()[0]);
      await user.keyboard("{ArrowLeft}");

      expect(currentSlideNumber()).toBe(SLIDE_COUNT);
    });
  });

  describe("autoplay", () => {
    it("advances to the next slide after the dwell elapses", () => {
      jest.useFakeTimers();
      render(<HeroSection />);

      expect(currentSlideNumber()).toBe(1);

      act(() => {
        jest.advanceTimersByTime(DWELL_MS);
      });
      expect(currentSlideNumber()).toBe(2);

      act(() => {
        jest.advanceTimersByTime(DWELL_MS);
      });
      expect(currentSlideNumber()).toBe(3);
    });

    it("wraps from the last slide back to the first", () => {
      jest.useFakeTimers();
      render(<HeroSection />);

      // One dwell at a time: collapsing them into a single jump lets Jest
      // flush the timer the effect re-registers mid-window, which double-counts.
      const seen: number[] = [];
      for (let i = 0; i < SLIDE_COUNT; i++) {
        act(() => {
          jest.advanceTimersByTime(DWELL_MS);
        });
        seen.push(currentSlideNumber());
      }

      expect(seen).toEqual([2, 3, 4, 1]);
    });

    it("stops advancing while the tab is hidden and resumes when it returns", () => {
      jest.useFakeTimers();
      render(<HeroSection />);

      setTabHidden(true);
      for (let i = 0; i < 3; i++) {
        act(() => {
          jest.advanceTimersByTime(DWELL_MS);
        });
      }
      expect(currentSlideNumber()).toBe(1);

      setTabHidden(false);
      act(() => {
        jest.advanceTimersByTime(DWELL_MS);
      });
      expect(currentSlideNumber()).toBe(2);
    });

    it("marks the indicator fill paused while the tab is hidden", () => {
      render(<HeroSection />);

      expect(screen.getByTestId("hero-indicator-fill")).toHaveAttribute(
        "data-paused",
        "false"
      );

      setTabHidden(true);
      expect(screen.getByTestId("hero-indicator-fill")).toHaveAttribute(
        "data-paused",
        "true"
      );
    });

    it("renders the fill only on the active indicator", async () => {
      const user = userEvent.setup();
      render(<HeroSection />);

      expect(screen.getAllByTestId("hero-indicator-fill")).toHaveLength(1);
      expect(indicators()[0]).toContainElement(
        screen.getByTestId("hero-indicator-fill")
      );

      await user.click(indicators()[2]);

      expect(indicators()[2]).toContainElement(
        screen.getByTestId("hero-indicator-fill")
      );
    });
  });

  describe("reduced motion", () => {
    it("cross-fades instead of sliding and disables autoplay", () => {
      jest.useFakeTimers();
      setPrefersReducedMotion(true);
      render(<HeroSection />);

      expect(screen.getByTestId("hero-crossfade")).toBeInTheDocument();
      expect(screen.queryByTestId("hero-track")).not.toBeInTheDocument();

      for (let i = 0; i < 3; i++) {
        act(() => {
          jest.advanceTimersByTime(DWELL_MS);
        });
      }
      expect(currentSlideNumber()).toBe(1);
    });

    it("keeps the indicators usable", async () => {
      setPrefersReducedMotion(true);
      const user = userEvent.setup();
      render(<HeroSection />);

      await user.click(indicators()[1]);

      expect(currentSlideNumber()).toBe(2);
    });
  });
});
