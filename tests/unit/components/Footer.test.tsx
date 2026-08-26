import { render, screen } from "@testing-library/react";
import { Footer } from "@/components/layout/Footer";

describe("Footer Component", () => {
  it("renders main navigation links in display typography", () => {
    render(<Footer locale="vi" />);

    expect(screen.getByRole("link", { name: /our story/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /heritage/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /taproom/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /shop/i })).toBeInTheDocument();
  });

  it("renders copyright notice and secondary links", () => {
    render(<Footer locale="vi" />);

    expect(
      screen.getByText(/© 2024 OTTER BEER COMPANY. BREWED WITH HONOR./i)
    ).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /privacy policy/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /terms of service/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /wholesale/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /contact/i })).toBeInTheDocument();
  });

  it("renders social and action icons with accessible labels", () => {
    render(<Footer locale="vi" />);

    expect(screen.getByLabelText("Instagram")).toBeInTheDocument();
    expect(screen.getByLabelText("Scan QR Code")).toBeInTheDocument();
    expect(screen.getByLabelText("Threads / Social")).toBeInTheDocument();
  });

  it("uses the theme background with primary-blue text, not a hardcoded dark fill", () => {
    render(<Footer locale="vi" />);

    const footer = screen.getByRole("contentinfo");
    expect(footer.className).toContain("bg-background");
    expect(footer.className).toContain("text-primary");
    expect(footer.className).not.toContain("bg-[#002f82]");

    const storyLink = screen.getByRole("link", { name: /our story/i });
    expect(storyLink.className).toContain("text-primary");
    expect(storyLink.className).not.toContain("text-white");
  });

  it("prepends locale for non-default locale", () => {
    render(<Footer locale="en" />);

    const storyLink = screen.getByRole("link", { name: /our story/i });
    expect(storyLink).toHaveAttribute("href", "/en#story");

    const privacyLink = screen.getByRole("link", { name: /privacy policy/i });
    expect(privacyLink).toHaveAttribute("href", "/en/privacy");
  });
});
