import { render, screen } from "@testing-library/react";
import ContactSection from "@/app/[locale]/(marketing)/contact/contact";

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
});
