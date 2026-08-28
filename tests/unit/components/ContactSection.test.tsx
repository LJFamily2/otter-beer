import { render, screen } from "@testing-library/react";
import ContactSection from "@/app/[locale]/(marketing)/contact/Contact";
import { ADDRESS, CONTACT } from "@/config/brand";

describe("ContactSection", () => {
  it("renders the hero headline, CTA buttons, and contact details", () => {
    render(<ContactSection locale="en" />);

    expect(
      screen.getByRole("heading", { name: /crafted in tay ninh/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /call us/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send email/i })).toBeInTheDocument();
    expect(screen.getByText(/phone numbers/i)).toBeInTheDocument();
    expect(screen.getByText(/the taproom & brewery/i)).toBeInTheDocument();
  });

  it("renders Vietnamese copy for the vi locale", () => {
    render(<ContactSection locale="vi" />);

    expect(
      screen.getByRole("heading", { name: /đậm chất tây ninh/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /gọi ngay/i })).toBeInTheDocument();
    expect(screen.getByText(/taproom & nhà máy/i)).toBeInTheDocument();
  });

  describe("heading level", () => {
    it("defaults to h1 for the standalone /contact page", () => {
      render(<ContactSection locale="en" />);

      expect(
        screen.getByRole("heading", { level: 1, name: /crafted in tay ninh/i }),
      ).toBeInTheDocument();
    });

    it("renders as h2 when embedded on a page that owns its own h1", () => {
      render(<ContactSection locale="en" headingLevel="h2" />);

      expect(
        screen.getByRole("heading", { level: 2, name: /crafted in tay ninh/i }),
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

    it("renders the embedded Google Map iframe with accessibility title", () => {
      render(<ContactSection locale="en" />);

      const iframe = screen.getByTitle("Tay Ninh Otter Beer Brewery Map");
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute(
        "src",
        expect.stringContaining("google.com/maps/embed"),
      );
    });
  });
});
