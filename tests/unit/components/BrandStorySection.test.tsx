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

    expect(screen.getAllByText("CÂU CHUYỆN THƯƠNG HIỆU")[0]).toBeInTheDocument();
    expect(screen.getByText("Trang 1 / 5")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Trang trước" })[0]).toBeDisabled();
    expect(screen.getAllByRole("button", { name: "Trang sau" })[0]).toBeEnabled();
  });

  it("falls back to English chrome copy for an unsupported locale", () => {
    render(<BrandStorySection locale="fr" />);

    expect(screen.getAllByText("BRAND STORY")[0]).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Previous page" })[0]).toBeInTheDocument();
  });

  it("advances to the next spread and back on arrow clicks", async () => {
    const user = userEvent.setup();
    render(<BrandStorySection locale="vi" />);

    await user.click(screen.getAllByRole("button", { name: "Trang sau" })[0]);
    expect(screen.getByText("Trang 2 / 5")).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: "Trang trước" })[0]);
    expect(screen.getByText("Trang 1 / 5")).toBeInTheDocument();
  });

  it("disables the next arrow on the last spread and re-enables prev", async () => {
    const user = userEvent.setup();
    render(<BrandStorySection locale="vi" />);
    const next = screen.getAllByRole("button", { name: "Trang sau" })[0];

    for (let i = 0; i < 4; i++) {
      await user.click(next);
    }

    expect(screen.getByText("Trang 5 / 5")).toBeInTheDocument();
    expect(next).toBeDisabled();
    expect(screen.getAllByRole("button", { name: "Trang trước" })[0]).toBeEnabled();
  });

  it("exposes only the current spread to the a11y tree while a page is turning", async () => {
    const user = userEvent.setup();
    render(<BrandStorySection locale="vi" />);

    await user.click(screen.getAllByRole("button", { name: "Trang sau" })[0]);

    expect(screen.getByText("Trang 2 / 5")).toBeInTheDocument();
  });

  it("does not advance past the last spread", async () => {
    const user = userEvent.setup();
    render(<BrandStorySection locale="vi" />);
    const next = screen.getAllByRole("button", { name: "Trang sau" })[0];

    for (let i = 0; i < 6; i++) {
      await user.click(next);
    }

    expect(screen.getByText("Trang 5 / 5")).toBeInTheDocument();
  });

  describe("chapter page-edge stack", () => {
    const chapterTabs = () => screen.queryAllByRole("button", { name: /^Mở chương / });

    it("renders one page-edge tab per chapter, the first marked current", () => {
      render(<BrandStorySection locale="vi" />);

      const tabs = chapterTabs();
      expect(tabs).toHaveLength(5);
      expect(tabs[0]).toHaveAttribute("aria-current", "true");
      expect(tabs[1]).not.toHaveAttribute("aria-current");
    });

    it("drops read chapters out of the stack as the reader advances", async () => {
      const user = userEvent.setup();
      render(<BrandStorySection locale="vi" />);

      await user.click(screen.getAllByRole("button", { name: "Trang sau" })[0]);
      await user.click(screen.getAllByRole("button", { name: "Trang sau" })[0]);

      const tabs = chapterTabs();
      expect(tabs).toHaveLength(3);
      expect(tabs[0]).toHaveAccessibleName("Mở chương Brewing");
      expect(screen.queryByRole("button", { name: "Mở chương Our Story" })).not.toBeInTheDocument();
    });

    it("restores read chapters to the stack when the reader goes back", async () => {
      const user = userEvent.setup();
      render(<BrandStorySection locale="vi" />);

      await user.click(screen.getAllByRole("button", { name: "Trang sau" })[0]);
      expect(chapterTabs()).toHaveLength(4);

      await user.click(screen.getAllByRole("button", { name: "Trang trước" })[0]);
      expect(chapterTabs()).toHaveLength(5);
    });

    it("jumps to a chapter when its tab is clicked", async () => {
      const user = userEvent.setup();
      render(<BrandStorySection locale="vi" />);

      await user.click(screen.getByRole("button", { name: "Mở chương Community" }));

      expect(screen.getByText("Trang 4 / 5")).toBeInTheDocument();
      expect(chapterTabs()).toHaveLength(2);
    });
  });

  describe("keyboard and chrome copy", () => {
    it("turns pages with the arrow keys", async () => {
      const user = userEvent.setup();
      render(<BrandStorySection locale="vi" />);

      const book = screen.getByRole("group", { name: "Cuốn sách câu chuyện thương hiệu" });
      book.focus();

      await user.keyboard("{ArrowRight}");
      expect(screen.getByText("Trang 2 / 5")).toBeInTheDocument();

      await user.keyboard("{ArrowLeft}");
      expect(screen.getByText("Trang 1 / 5")).toBeInTheDocument();
    });

    it("renders the localized feature list and instruction bar", () => {
      render(<BrandStorySection locale="vi" />);

      expect(screen.getByText("LẬT SÁCH MƯỢT MÀ")).toBeInTheDocument();
      expect(screen.getByText("BỐ CỤC TỰ DO")).toBeInTheDocument();
      expect(screen.getByText("TRẢI NGHIỆM TỰ NHIÊN")).toBeInTheDocument();
      expect(screen.getByText("CLICK / ARROW KEY")).toBeInTheDocument();
      expect(screen.getByText("Vuốt trái / phải trên mobile")).toBeInTheDocument();
    });

    it("falls back to English feature and instruction copy", () => {
      render(<BrandStorySection locale="fr" />);

      expect(screen.getByText("SMOOTH PAGE TURNS")).toBeInTheDocument();
      expect(screen.getByText("Drag the mouse to turn the page")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Open chapter Our Story" })).toBeInTheDocument();
    });
  });
});
