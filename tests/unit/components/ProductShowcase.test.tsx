import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductShowcase } from "@/components/sections/ProductShowcase";
import type { BeerShowcaseItem } from "@/lib/utils/BeerPresenter";

function beer(overrides: Partial<BeerShowcaseItem> = {}): BeerShowcaseItem {
  return {
    id: "beer-1",
    abv: "4.3%",
    ibu: 20,
    imageSrc: "/images/otter-beer-single-can.png",
    style: "PREMIUM LAGER",
    headline: "BREWING\nCONNECTIONS.",
    description: "A crisp pour.",
    shopUrl: "https://shop.example.com",
    findLocallyUrl: "https://find.example.com",
    themeColor: "#123456",
    themeColorContainer: "#654321",
    variants: [],
    ...overrides,
  };
}

describe("ProductShowcase Component", () => {
  it("renders the current beer's style, ABV, and IBU", () => {
    render(<ProductShowcase locale="en" beers={[beer()]} />);

    expect(screen.getAllByText("PREMIUM LAGER")[0]).toBeInTheDocument();
    expect(screen.getAllByText("4.3%")[0]).toBeInTheDocument();
    expect(screen.getAllByText("20")[0]).toBeInTheDocument();
  });

  it("applies the beer's theme colors as CSS variables on the section", () => {
    const { container } = render(<ProductShowcase locale="en" beers={[beer()]} />);
    const section = container.querySelector("section") as HTMLElement;

    expect(section.style.getPropertyValue("--color-primary")).toBe("#123456");
    expect(section.style.getPropertyValue("--color-primary-container")).toBe("#654321");
  });

  it("hides the shop CTA when shopUrl is missing but keeps find-locally", () => {
    render(<ProductShowcase locale="en" beers={[beer({ shopUrl: undefined })]} />);

    expect(screen.queryByRole("link", { name: /shop now/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /find locally/i })).toBeInTheDocument();
  });

  it("renders no CTA links when neither URL is set", () => {
    render(
      <ProductShowcase
        locale="en"
        beers={[beer({ shopUrl: undefined, findLocallyUrl: undefined })]}
      />
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("hides the prev/next navigation when only one beer is published", () => {
    render(<ProductShowcase locale="en" beers={[beer()]} />);

    expect(screen.queryByRole("button", { name: /previous product/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /next product/i })).not.toBeInTheDocument();
  });

  it("shows navigation and cycles between beers when multiple are published", async () => {
    const user = userEvent.setup();
    render(
      <ProductShowcase
        locale="en"
        beers={[beer({ id: "1", style: "STYLE A" }), beer({ id: "2", style: "STYLE B" })]}
      />
    );

    expect(screen.getAllByText("STYLE A")[0]).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /next product/i }));
    expect(screen.getAllByText("STYLE B")[0]).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /previous product/i }));
    expect(screen.getAllByText("STYLE A")[0]).toBeInTheDocument();
  });

  it("renders nothing when there are no published beers", () => {
    const { container } = render(<ProductShowcase locale="en" beers={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
