import { render, screen, fireEvent } from "@testing-library/react";
import { AgeGateWrapper } from "@/components/layout/AgeGateWrapper";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe("AgeGateWrapper Component", () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = "otter_age_verified=; max-age=0";
  });

  it("renders ONLY the age verification gate when user is unverified (hiding children)", () => {
    render(
      <AgeGateWrapper locale="vi">
        <header data-testid="header">Header Content</header>
        <main data-testid="main">Main Content</main>
        <footer data-testid="footer">Footer Content</footer>
      </AgeGateWrapper>
    );

    // Age gate is visible
    expect(
      screen.getByRole("heading", { name: /are you 18\+\?/i })
    ).toBeInTheDocument();

    // Layout elements are NOT in the document
    expect(screen.queryByTestId("header")).not.toBeInTheDocument();
    expect(screen.queryByTestId("main")).not.toBeInTheDocument();
    expect(screen.queryByTestId("footer")).not.toBeInTheDocument();
  });

  it("reveals header, main, and footer immediately after clicking YES", () => {
    render(
      <AgeGateWrapper locale="vi">
        <header data-testid="header">Header Content</header>
        <main data-testid="main">Main Content</main>
        <footer data-testid="footer">Footer Content</footer>
      </AgeGateWrapper>
    );

    // Click YES
    const yesBtn = screen.getByRole("button", { name: /yes/i });
    fireEvent.click(yesBtn);

    // Now layout elements are displayed
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("main")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();

    // Age gate is gone
    expect(
      screen.queryByRole("heading", { name: /are you 18\+\?/i })
    ).not.toBeInTheDocument();
  });

  it("renders children directly if already verified in localStorage", () => {
    localStorage.setItem("otter_age_verified", "true");

    render(
      <AgeGateWrapper locale="vi">
        <header data-testid="header">Header Content</header>
        <main data-testid="main">Main Content</main>
        <footer data-testid="footer">Footer Content</footer>
      </AgeGateWrapper>
    );

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("main")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /are you 18\+\?/i })
    ).not.toBeInTheDocument();
  });
});
