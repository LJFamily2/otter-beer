import { render, screen } from "@testing-library/react";
import { ContactCtaSection } from "@/components/sections/ContactCtaSection";

describe("ContactCtaSection Component", () => {
  it("renders the heading and copy for English locale", () => {
    render(<ContactCtaSection locale="en" />);

    expect(screen.getByText("GET IN TOUCH")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /we're just a message away/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/questions, partnerships, or just want to say hi/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /chat with us on zalo/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /message now on zalo/i })
    ).toHaveAttribute("href", "https://zalo.me");
  });

  it("renders Vietnamese content when locale is 'vi'", () => {
    render(<ContactCtaSection locale="vi" />);

    expect(screen.getByText("LIÊN HỆ VỚI CHÚNG TÔI")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /chúng tôi luôn sẵn sàng lắng nghe/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /nhắn tin ngay on zalo/i })
    ).toBeInTheDocument();
  });
});
