import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrandStorySection } from "@/components/sections/BrandStorySection";
import { BRAND_STORY_BOOK } from "@/config/brandStoryChapters";

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

const TOTAL = BRAND_STORY_BOOK.totalSpreads;

describe("BrandStorySection", () => {
  it("renders the first spread and localized chrome copy", () => {
    render(<BrandStorySection locale="vi" />);

    expect(screen.getAllByText("CÂU CHUYỆN THƯƠNG HIỆU")[0]).toBeInTheDocument();
    expect(screen.getByText(`Trang 1 / ${TOTAL}`)).toBeInTheDocument();
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
    expect(screen.getByText(`Trang 2 / ${TOTAL}`)).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: "Trang trước" })[0]);
    expect(screen.getByText(`Trang 1 / ${TOTAL}`)).toBeInTheDocument();
  });

  it("disables the next arrow on the last spread and re-enables prev", async () => {
    const user = userEvent.setup();
    render(<BrandStorySection locale="vi" />);
    const next = screen.getAllByRole("button", { name: "Trang sau" })[0];

    for (let i = 0; i < TOTAL - 1; i++) {
      await user.click(next);
    }

    expect(screen.getByText(`Trang ${TOTAL} / ${TOTAL}`)).toBeInTheDocument();
    expect(next).toBeDisabled();
    expect(screen.getAllByRole("button", { name: "Trang trước" })[0]).toBeEnabled();
  });

  it("exposes only the current spread to the a11y tree while a page is turning", async () => {
    const user = userEvent.setup();
    render(<BrandStorySection locale="vi" />);

    await user.click(screen.getAllByRole("button", { name: "Trang sau" })[0]);

    expect(screen.getByText(`Trang 2 / ${TOTAL}`)).toBeInTheDocument();
  });

  it("does not advance past the last spread", async () => {
    const user = userEvent.setup();
    render(<BrandStorySection locale="vi" />);
    const next = screen.getAllByRole("button", { name: "Trang sau" })[0];

    for (let i = 0; i < TOTAL + 3; i++) {
      await user.click(next);
    }

    expect(screen.getByText(`Trang ${TOTAL} / ${TOTAL}`)).toBeInTheDocument();
  });

  describe("chapter page-edge stack", () => {
    const chapterTabs = () => screen.queryAllByRole("button", { name: /^Mở chương / });
    const nextArrow = () => screen.getAllByRole("button", { name: "Trang sau" })[0];
    const prevArrow = () => screen.getAllByRole("button", { name: "Trang trước" })[0];

    it("renders one page-edge tab per chapter, the first marked current", () => {
      render(<BrandStorySection locale="vi" />);

      const tabs = chapterTabs();
      expect(tabs).toHaveLength(BRAND_STORY_BOOK.chapters.length);
      expect(tabs[0]).toHaveAttribute("aria-current", "true");
      expect(tabs[1]).not.toHaveAttribute("aria-current");
    });

    it("keeps a multi-image chapter current until all of its pages are turned", async () => {
      const user = userEvent.setup();
      render(<BrandStorySection locale="vi" />);

      // "Our Story" holds 3 images — two spreads' worth of turning.
      const [ourStory, ingredients] = BRAND_STORY_BOOK.chapters;
      expect(ourStory.spreadCount).toBe(2);

      await user.click(nextArrow());

      // Still inside the same chapter, so the tab has not changed over.
      expect(screen.getByRole("button", { name: `Mở chương ${ourStory.title}` })).toHaveAttribute(
        "aria-current",
        "true"
      );
      expect(chapterTabs()).toHaveLength(BRAND_STORY_BOOK.chapters.length);

      await user.click(nextArrow());

      // Only now does the next chapter take over.
      expect(screen.getByRole("button", { name: `Mở chương ${ingredients.title}` })).toHaveAttribute(
        "aria-current",
        "true"
      );
      expect(screen.queryByRole("button", { name: `Mở chương ${ourStory.title}` })).not.toBeInTheDocument();
    });

    it("gives a 4-image chapter two spreads before handing over", async () => {
      const user = userEvent.setup();
      render(<BrandStorySection locale="vi" />);

      const brewing = BRAND_STORY_BOOK.chapters[2];
      expect(brewing.images).toHaveLength(4);
      expect(brewing.spreadCount).toBe(2);

      await user.click(screen.getByRole("button", { name: `Mở chương ${brewing.title}` }));
      expect(screen.getByText(`Trang ${brewing.startSpread + 1} / ${TOTAL}`)).toBeInTheDocument();

      await user.click(nextArrow());
      expect(screen.getByRole("button", { name: `Mở chương ${brewing.title}` })).toHaveAttribute(
        "aria-current",
        "true"
      );

      await user.click(nextArrow());
      expect(screen.queryByRole("button", { name: `Mở chương ${brewing.title}` })).not.toBeInTheDocument();
    });

    it("drops read chapters out of the stack as the reader advances", async () => {
      const user = userEvent.setup();
      render(<BrandStorySection locale="vi" />);

      const community = BRAND_STORY_BOOK.chapters[3];
      await user.click(screen.getByRole("button", { name: `Mở chương ${community.title}` }));

      const tabs = chapterTabs();
      expect(tabs).toHaveLength(BRAND_STORY_BOOK.chapters.length - community.index);
      expect(tabs[0]).toHaveAccessibleName(`Mở chương ${community.title}`);
    });

    it("restores read chapters to the stack when the reader goes back", async () => {
      const user = userEvent.setup();
      render(<BrandStorySection locale="vi" />);

      const ingredients = BRAND_STORY_BOOK.chapters[1];
      await user.click(screen.getByRole("button", { name: `Mở chương ${ingredients.title}` }));
      expect(chapterTabs()).toHaveLength(BRAND_STORY_BOOK.chapters.length - 1);

      await user.click(prevArrow());
      expect(chapterTabs()).toHaveLength(BRAND_STORY_BOOK.chapters.length);
    });

    it("jumps to the chapter's first spread when its tab is clicked", async () => {
      const user = userEvent.setup();
      render(<BrandStorySection locale="vi" />);

      const journal = BRAND_STORY_BOOK.chapters[4];
      await user.click(screen.getByRole("button", { name: `Mở chương ${journal.title}` }));

      expect(screen.getByText(`Trang ${journal.startSpread + 1} / ${TOTAL}`)).toBeInTheDocument();
      expect(chapterTabs()).toHaveLength(1);
    });

    it("announces how far through a chapter's images the reader is", async () => {
      const user = userEvent.setup();
      render(<BrandStorySection locale="vi" />);

      expect(screen.getByText("Trang 1 / 2 của chương, gồm 3 ảnh")).toBeInTheDocument();

      await user.click(nextArrow());
      expect(screen.getByText("Trang 2 / 2 của chương, gồm 3 ảnh")).toBeInTheDocument();
    });
  });

  describe("keyboard and chrome copy", () => {
    it("turns pages with the arrow keys", async () => {
      const user = userEvent.setup();
      render(<BrandStorySection locale="vi" />);

      const book = screen.getByRole("group", { name: "Cuốn sách câu chuyện thương hiệu" });
      book.focus();

      await user.keyboard("{ArrowRight}");
      expect(screen.getByText(`Trang 2 / ${TOTAL}`)).toBeInTheDocument();

      await user.keyboard("{ArrowLeft}");
      expect(screen.getByText(`Trang 1 / ${TOTAL}`)).toBeInTheDocument();
    });

    it("renders the localized title block", () => {
      render(<BrandStorySection locale="vi" />);

      // Mobile renders its own hard-coded h2, so target the desktop line spans.
      const heading = screen.getByText("TỪ HẠT").closest("h2");
      expect(heading).toHaveTextContent("TỪ HẠTLÚA MẠCHĐẾN LY BIA");
      expect(screen.getByText("05 CHƯƠNG")).toBeInTheDocument();
    });

    it("falls back to English title copy", () => {
      render(<BrandStorySection locale="fr" />);

      expect(screen.getByText("GRAIN TO").closest("h2")).toHaveTextContent("FROMGRAIN TOGLASS");
      expect(screen.getByText("05 CHAPTERS")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Open chapter Our Story" })).toBeInTheDocument();
    });

    it("drops the how-to-use feature list and instruction bar", () => {
      render(<BrandStorySection locale="vi" />);

      expect(screen.queryByText("LẬT SÁCH MƯỢT MÀ")).not.toBeInTheDocument();
      expect(screen.queryByText("BỐ CỤC TỰ DO")).not.toBeInTheDocument();
      expect(screen.queryByText("TRẢI NGHIỆM TỰ NHIÊN")).not.toBeInTheDocument();
      expect(screen.queryByText("CLICK / ARROW KEY")).not.toBeInTheDocument();
      expect(screen.queryByText("Vuốt trái / phải trên mobile")).not.toBeInTheDocument();
    });

    it("keeps heading leading loose enough for Anton's Vietnamese diacritics", () => {
      // Measured in-browser: "LÚA MẠCH" inks 1.304em tall in Anton (tall accents
      // plus the dot under Ạ). Anything below ~1.31 collides the accents with
      // the line above at any font size. jsdom can't measure glyphs, so pin the
      // class instead — the number is the point, not the styling.
      render(<BrandStorySection locale="vi" />);

      const heading = screen.getByText("TỪ HẠT").closest("h2")!;
      const leading = heading.className.match(/leading-\[([\d.]+)\]/);
      expect(leading).not.toBeNull();
      expect(Number(leading![1])).toBeGreaterThanOrEqual(1.31);
    });

    it("colours the heading against the dark stage, not with the global h2 rule", () => {
      // globals.css sets a bare `h2 { color: var(--color-primary) }` outside any
      // cascade layer, which beats a Tailwind text-* utility on the h2 itself.
      // The visible text therefore has to carry its own colour.
      render(<BrandStorySection locale="vi" />);

      const line = screen.getByText("TỪ HẠT");
      expect(line.tagName).toBe("SPAN");
      expect(line).toHaveClass("text-[#f5f1ea]");
    });
  });
});
