import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrandStorySection } from "@/components/sections/BrandStorySection";

jest.mock("react-pageflip", () => {
  const MockFlipBook = React.forwardRef<
    { pageFlip: () => { flipNext: () => void; flipPrev: () => void; turnToPage: (page: number) => void } },
    { children?: React.ReactNode; onFlip?: (e: { data: number }) => void }
  >(({ children, onFlip }, ref) => {
    let currentPage = 0;
    React.useImperativeHandle(ref, () => ({
      pageFlip: () => ({
        flipNext: () => {
          currentPage = Math.min(currentPage + 2, 4);
          onFlip?.({ data: currentPage });
        },
        flipPrev: () => {
          currentPage = Math.max(currentPage - 2, 0);
          onFlip?.({ data: currentPage });
        },
        turnToPage: (page: number) => {
          currentPage = page;
          onFlip?.({ data: currentPage });
        },
      }),
    }));
    return <div className="mock-flipbook">{children}</div>;
  });
  MockFlipBook.displayName = "MockFlipBook";
  return {
    __esModule: true,
    default: MockFlipBook,
  };
});

describe("BrandStorySection", () => {
  it("renders the first spread and localized chrome copy", () => {
    render(<BrandStorySection locale="vi" />);

    expect(screen.getByText("CÂU CHUYỆN THƯƠNG HIỆU")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Copper Kettle/ })).toBeInTheDocument();
    expect(screen.getByText("Trang 1 / 3")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Trang trước" })[0]).toBeDisabled();
    expect(screen.getAllByRole("button", { name: "Trang sau" })[0]).toBeEnabled();
  });

  it("falls back to English chrome copy for an unsupported locale", () => {
    render(<BrandStorySection locale="fr" />);

    expect(screen.getByText("BRAND STORY")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Previous page" })[0]).toBeInTheDocument();
  });

  it("advances to the next spread and back on arrow clicks", async () => {
    const user = userEvent.setup();
    render(<BrandStorySection locale="vi" />);

    await user.click(screen.getAllByRole("button", { name: "Trang sau" })[0]);
    expect(screen.getByText("Trang 2 / 3")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Hops & Malt/ })).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: "Trang trước" })[0]);
    expect(screen.getByText("Trang 1 / 3")).toBeInTheDocument();
  });

  it("disables the next arrow on the last spread and re-enables prev", async () => {
    const user = userEvent.setup();
    render(<BrandStorySection locale="vi" />);
    const next = screen.getAllByRole("button", { name: "Trang sau" })[0];

    await user.click(next);
    await user.click(next);

    expect(screen.getByText("Trang 3 / 3")).toBeInTheDocument();
    expect(next).toBeDisabled();
    expect(screen.getAllByRole("button", { name: "Trang trước" })[0]).toBeEnabled();
  });

  it("exposes only the current spread to the a11y tree while a page is turning", async () => {
    const user = userEvent.setup();
    render(<BrandStorySection locale="vi" />);

    await user.click(screen.getAllByRole("button", { name: "Trang sau" })[0]);

    expect(screen.getByRole("heading", { name: /Hops & Malt/ })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /Copper Kettle/ })).not.toBeInTheDocument();
  });

  it("does not advance past the last spread", async () => {
    const user = userEvent.setup();
    render(<BrandStorySection locale="vi" />);
    const next = screen.getAllByRole("button", { name: "Trang sau" })[0];

    await user.click(next);
    await user.click(next);
    await user.click(next);

    expect(screen.getByText("Trang 3 / 3")).toBeInTheDocument();
  });
});
