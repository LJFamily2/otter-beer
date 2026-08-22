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

    expect(screen.getByText("PHONE NUMBERS")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "(+84) 908 790 102" })).toHaveAttribute(
      "href",
      "tel:+84908790102"
    );
    expect(screen.getByRole("link", { name: "(+84) 981 686 491" })).toHaveAttribute(
      "href",
      "tel:+84981686491"
    );

    expect(screen.getByText("THE TAPROOM")).toBeInTheDocument();
    expect(screen.getByText("BADENBEER Co., Ltd.")).toBeInTheDocument();
    expect(
      screen.getByText(/13 house, alley 30, lac long quan street/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /get directions/i })
    ).toHaveAttribute("href", expect.stringContaining("https://maps.google.com"));
    expect(
      screen.getByRole("link", { name: /visit our factory/i })
    ).toHaveAttribute("href", expect.stringContaining("https://maps.google.com"));
  });

  it("renders Vietnamese content when locale is 'vi'", () => {
    render(<ContactCtaSection locale="vi" />);

    expect(screen.getByText("KẾT NỐI CÙNG OTTER BEER")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /chúng tôi luôn sẵn sàng lắng nghe/i })
    ).toBeInTheDocument();

    expect(screen.getByText("SỐ ĐIỆN THOẠI")).toBeInTheDocument();
    expect(screen.getByText("TAPROOM")).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /chỉ đường/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /tham quan nhà máy/i })
    ).toBeInTheDocument();
  });

  it("uses custom mapsUrl and factoryUrl when provided", () => {
    render(
      <ContactCtaSection
        locale="en"
        mapsUrl="https://maps.google.com/custom-taproom"
        factoryUrl="https://maps.google.com/custom-factory"
      />
    );

    expect(
      screen.getByRole("link", { name: /get directions/i })
    ).toHaveAttribute("href", "https://maps.google.com/custom-taproom");
    expect(
      screen.getByRole("link", { name: /visit our factory/i })
    ).toHaveAttribute("href", "https://maps.google.com/custom-factory");
  });
});