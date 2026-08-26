import { render, screen } from "@testing-library/react";
import ContactSection from "@/app/[locale]/(marketing)/contact/contact";
import { ADDRESS, CONTACT } from "@/config/brand";

describe("ContactSection", () => {
  it("renders the hero headline, CTA buttons, and contact details", () => {
    render(<ContactSection locale="en" />);

    expect(
      screen.getByRole("heading", { name: /let.?s talk beer/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /call us/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /message/i })).toBeInTheDocument();
    expect(screen.getByText(/phone numbers/i)).toBeInTheDocument();
    expect(screen.getByText(/the taproom/i)).toBeInTheDocument();
  });

  it("renders Vietnamese copy for the vi locale", () => {
    // The vi block used to be a verbatim copy of the English one, so the
    // Vietnamese page carried no Vietnamese contact keywords at all.
    render(<ContactSection locale="vi" />);

    expect(
      screen.getByRole("heading", { name: /liên hệ otter beer/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /gọi ngay/i })).toBeInTheDocument();
    expect(screen.getByText(/taproom tây ninh/i)).toBeInTheDocument();
  });

  describe("heading level", () => {
    it("defaults to h1 for the standalone /contact page", () => {
      render(<ContactSection locale="en" />);

      expect(
        screen.getByRole("heading", { level: 1, name: /let.?s talk beer/i }),
      ).toBeInTheDocument();
    });

    it("renders as h2 when embedded on a page that owns its own h1", () => {
      // The homepage embeds this section below the hero. Two h1s on a page
      // leaves a crawler no single statement of what the page is about.
      render(<ContactSection locale="en" headingLevel="h2" />);

      expect(
        screen.getByRole("heading", { level: 2, name: /let.?s talk beer/i }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { level: 1 }),
      ).not.toBeInTheDocument();
    });
  });

  describe("machine-readable contact details", () => {
    it("marks the postal address up as an <address>", () => {
      const { container } = render(<ContactSection locale="en" />);
      const address = container.querySelector("address");

      expect(address).toBeInTheDocument();
      expect(address).toHaveTextContent(/Lac Long Quan/i);
    });

    it("keeps the visible address in step with the structured-data source", () => {
      // The Brewery JSON-LD emits ADDRESS verbatim. If the visible copy and
      // the markup disagree on the brewery's location, both lose trust.
      render(<ContactSection locale="en" />);

      expect(
        screen.getByText(new RegExp(ADDRESS.addressRegion, "i")),
      ).toBeInTheDocument();
    });

    it("makes both phone numbers dialable", () => {
      render(<ContactSection locale="en" />);

      for (const phone of CONTACT.phones) {
        expect(
          document.querySelector(`a[href="tel:${phone}"]`),
        ).toBeInTheDocument();
      }
    });
  });
});
