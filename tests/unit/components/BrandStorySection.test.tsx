import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrandStorySection } from "@/components/sections/BrandStorySection";

describe("BrandStorySection", () => {
  it("renders the first spread and localized chrome copy", () => {
    render(<BrandStorySection locale="vi" />);

    expect(screen.getByText("CÂU CHUYỆN THƯƠNG HIỆU")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Copper Kettle/ })).toBeInTheDocument();
    expect(screen.getByText("Trang 1 / 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Trang trước" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Trang sau" })).toBeEnabled();
  });

  it("falls back to English chrome copy for an unsupported locale", () => {
    render(<BrandStorySection locale="fr" />);

    expect(screen.getByText("BRAND STORY")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeInTheDocument();
  });

  it("advances to the next spread and back on arrow clicks", async () => {
    const user = userEvent.setup();
    render(<BrandStorySection locale="vi" />);

    await user.click(screen.getByRole("button", { name: "Trang sau" }));
    expect(screen.getByText("Trang 2 / 3")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Hops & Malt/ })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Trang trước" }));
    expect(screen.getByText("Trang 1 / 3")).toBeInTheDocument();
  });

  it("disables the next arrow on the last spread and re-enables prev", async () => {
    const user = userEvent.setup();
    render(<BrandStorySection locale="vi" />);
    const next = screen.getByRole("button", { name: "Trang sau" });

    await user.click(next);
    await user.click(next);

    expect(screen.getByText("Trang 3 / 3")).toBeInTheDocument();
    expect(next).toBeDisabled();
    expect(screen.getByRole("button", { name: "Trang trước" })).toBeEnabled();
  });

  it("does not advance past the last spread", async () => {
    const user = userEvent.setup();
    render(<BrandStorySection locale="vi" />);
    const next = screen.getByRole("button", { name: "Trang sau" });

    await user.click(next);
    await user.click(next);
    await user.click(next);

    expect(screen.getByText("Trang 3 / 3")).toBeInTheDocument();
  });
});
