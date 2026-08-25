import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CookieConsent } from "@/components/ui/CookieConsent";

const STORAGE_KEY = "otter_beer_cookie_consent";

/** Tailwind class helper — reads the class list off a rendered element. */
const classesOf = (el: HTMLElement) => el.className.split(/\s+/);

describe("CookieConsent Component", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("visibility", () => {
    it("shows the banner when no consent has been stored", async () => {
      render(<CookieConsent />);

      expect(
        await screen.findByRole("region", { name: /cookie consent/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: /your privacy choice/i })
      ).toBeInTheDocument();
    });

    it("stays hidden when consent already exists in storage", () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ essential: true, analytics: true, marketing: true })
      );

      render(<CookieConsent />);

      expect(
        screen.queryByRole("region", { name: /cookie consent/i })
      ).not.toBeInTheDocument();
    });
  });

  describe("theme colors", () => {
    it("renders the primary 'Accept All' CTA in the navy theme color, not mahogany red", async () => {
      render(<CookieConsent />);
      const acceptAll = await screen.findByRole("button", {
        name: /accept all/i,
      });

      expect(classesOf(acceptAll)).toEqual(
        expect.arrayContaining([
          "bg-primary",
          "hover:bg-primary-container",
          "text-on-primary",
        ])
      );
      expect(acceptAll.className).not.toMatch(/mahogany/);
    });

    it("does not use the mahogany token anywhere in the cookie section", async () => {
      render(<CookieConsent />);
      const banner = await screen.findByRole("region", {
        name: /cookie consent/i,
      });
      await userEvent.click(
        within(banner).getByRole("button", { name: /settings/i })
      );

      const dialog = screen.getByRole("dialog", { name: /cookie preferences/i });
      expect(banner.innerHTML).not.toMatch(/mahogany/);
      expect(dialog.innerHTML).not.toMatch(/mahogany/);
    });

    it("styles the secondary banner actions as outlined, non-filled buttons", async () => {
      render(<CookieConsent />);

      const settings = await screen.findByRole("button", { name: /settings/i });
      const reject = screen.getByRole("button", {
        name: /reject non-essential/i,
      });

      expect(classesOf(settings)).toEqual(
        expect.arrayContaining(["text-primary", "border-primary"])
      );
      // A 10% tint on hover is fine; a solid fill would make it a second CTA.
      expect(classesOf(settings)).not.toContain("bg-primary");
      expect(classesOf(reject)).toEqual(
        expect.arrayContaining(["text-on-surface-variant", "border-outline-variant"])
      );
      expect(classesOf(reject)).not.toContain("bg-primary");
    });

    it("gives every banner control a themed focus ring for keyboard users", async () => {
      render(<CookieConsent />);
      const banner = await screen.findByRole("region", {
        name: /cookie consent/i,
      });

      for (const button of within(banner).getAllByRole("button")) {
        expect(button.className).toMatch(
          /focus-visible:outline-primary/
        );
      }
    });

    it("keeps the modal 'Save Preferences' CTA on the same primary token as 'Accept All'", async () => {
      render(<CookieConsent />);
      await userEvent.click(
        await screen.findByRole("button", { name: /settings/i })
      );

      const save = screen.getByRole("button", { name: /save preferences/i });
      expect(classesOf(save)).toEqual(
        expect.arrayContaining([
          "bg-primary",
          "hover:bg-primary-container",
          "text-on-primary",
        ])
      );
    });

    it("uses a theme-token hover on the Privacy Policy link", async () => {
      render(<CookieConsent />);
      const link = await screen.findByRole("link", { name: /privacy policy/i });

      expect(link).toHaveAttribute("href", "/privacy");
      expect(classesOf(link)).toEqual(
        expect.arrayContaining(["text-primary", "hover:text-primary-container"])
      );
    });
  });

  describe("consent actions", () => {
    it("stores full consent when 'Accept All' is clicked and dismisses the banner", async () => {
      render(<CookieConsent />);
      await userEvent.click(
        await screen.findByRole("button", { name: /accept all/i })
      );

      expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({
        essential: true,
        analytics: true,
        marketing: true,
      });
      expect(
        screen.queryByRole("region", { name: /cookie consent/i })
      ).not.toBeInTheDocument();
    });

    it("stores essential-only consent when 'Reject Non-Essential' is clicked", async () => {
      render(<CookieConsent />);
      await userEvent.click(
        await screen.findByRole("button", { name: /reject non-essential/i })
      );

      expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({
        essential: true,
        analytics: false,
        marketing: false,
      });
    });

    it("saves the exact preferences toggled in the settings modal", async () => {
      render(<CookieConsent />);
      await userEvent.click(
        await screen.findByRole("button", { name: /settings/i })
      );

      // Defaults: analytics on, marketing off — flip both.
      await userEvent.click(
        screen.getByRole("checkbox", { name: /analytics cookies/i })
      );
      await userEvent.click(
        screen.getByRole("checkbox", { name: /marketing cookies/i })
      );
      await userEvent.click(
        screen.getByRole("button", { name: /save preferences/i })
      );

      expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({
        essential: true,
        analytics: false,
        marketing: true,
      });
    });

    it("closes the modal without storing consent when 'Cancel' is clicked", async () => {
      render(<CookieConsent />);
      await userEvent.click(
        await screen.findByRole("button", { name: /settings/i })
      );
      await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
      expect(
        screen.getByRole("region", { name: /cookie consent/i })
      ).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("exposes the settings modal as a labelled modal dialog", async () => {
      render(<CookieConsent />);
      await userEvent.click(
        await screen.findByRole("button", { name: /settings/i })
      );

      const dialog = screen.getByRole("dialog", { name: /cookie preferences/i });
      expect(dialog).toHaveAttribute("aria-modal", "true");
    });

    it("marks essential cookies as always active with no toggle", async () => {
      render(<CookieConsent />);
      await userEvent.click(
        await screen.findByRole("button", { name: /settings/i })
      );

      expect(screen.getByText(/always active/i)).toBeInTheDocument();
      expect(screen.getAllByRole("checkbox")).toHaveLength(2);
    });
  });
});
