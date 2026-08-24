import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NewsBlogSection } from "@/components/sections/NewsBlogSection";

/** jsdom implements no scrolling — the rail only needs the call to be observable. */
function mockRailScrolling() {
  const scrollBy = jest.fn();
  Object.defineProperty(HTMLElement.prototype, "scrollBy", {
    value: scrollBy,
    writable: true,
    configurable: true,
  });
  return scrollBy;
}

describe("NewsBlogSection Component", () => {
  it("renders the English masthead and story cards", () => {
    render(<NewsBlogSection locale="en" />);

    expect(
      screen.getByRole("heading", { name: /the otter journal/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/news & blog/i)).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /brewhouse diary/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /hops of tay ninh/i })
    ).toBeInTheDocument();
    expect(screen.getByText("BEHIND THE SCENES")).toBeInTheDocument();
  });

  it("renders Vietnamese copy and tags when locale is 'vi'", () => {
    render(<NewsBlogSection locale="vi" />);

    expect(
      screen.getByRole("heading", { name: /chuyện nhà otter/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /nhật ký nhà nấu/i })
    ).toBeInTheDocument();
    expect(screen.getByText("HẬU TRƯỜNG")).toBeInTheDocument();
  });

  it("links every card and the view-all CTA to the blog, locale-prefixed", () => {
    const { unmount } = render(<NewsBlogSection locale="vi" />);

    // vi is the default locale, so it carries no URL prefix.
    for (const link of screen.getAllByRole("link")) {
      expect(link).toHaveAttribute("href", "/blog");
    }
    expect(
      screen.getByRole("link", { name: /xem tất cả bài viết/i })
    ).toBeInTheDocument();

    unmount();
    render(<NewsBlogSection locale="en" />);

    for (const link of screen.getAllByRole("link")) {
      expect(link).toHaveAttribute("href", "/en/blog");
    }
  });

  it("scrolls the rail forward by one card when the next arrow is clicked", async () => {
    const scrollBy = mockRailScrolling();
    render(<NewsBlogSection locale="en" />);

    await userEvent.click(
      screen.getByRole("button", { name: /next story/i })
    );

    expect(scrollBy).toHaveBeenCalledTimes(1);
    const [{ left }] = scrollBy.mock.calls[0] as [{ left: number }];
    expect(left).toBeGreaterThanOrEqual(0);
  });

  it("disables the previous arrow while the rail sits at its start", () => {
    mockRailScrolling();
    render(<NewsBlogSection locale="en" />);

    expect(screen.getByRole("button", { name: /previous story/i })).toBeDisabled();
  });

  it("exposes the rail as a labelled, keyboard-reachable region", () => {
    render(<NewsBlogSection locale="en" />);

    const rail = screen.getByRole("region", { name: /featured stories carousel/i });
    expect(rail).toHaveAttribute("tabindex", "0");
    expect(within(rail).getAllByRole("link")).toHaveLength(5);
  });
});
