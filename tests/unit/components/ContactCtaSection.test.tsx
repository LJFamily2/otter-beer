import { render, screen } from "@testing-library/react";
import { ContactCtaSection } from "@/components/sections/ContactCtaSection";

describe("ContactCtaSection Component", () => {
  it("renders the heading and copy for English locale", () => {
    render(<ContactCtaSection locale="en" />);

    expect(screen.getByText("GET IN TOUCH WITH OTTER")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /we're always a message away/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/product inquiries, distribution partnerships/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /chat with us on zalo/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /direct message on zalo/i })
    ).toHaveAttribute("href", "https://zalo.me");
  });

  it("renders Vietnamese content when locale is 'vi'", () => {
    render(<ContactCtaSection locale="vi" />);

    expect(screen.getByText("KẾT NỐI CÙNG OTTER BEER")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /chúng tôi luôn sẵn sàng lắng nghe/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /nhắn tin trực tiếp on zalo/i })
    ).toBeInTheDocument();
  });
});
