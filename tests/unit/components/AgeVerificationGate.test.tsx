import { render, screen, fireEvent } from "@testing-library/react";
import { AgeVerificationGate } from "@/components/ui/AgeVerificationGate";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe("AgeVerificationGate Component", () => {
  beforeEach(() => {
    localStorage.clear();
    // Clear cookies
    document.cookie = "otter_age_verified=; max-age=0";
  });

  it("renders when user has not verified their age yet", () => {
    render(<AgeVerificationGate isStandalone={true} />);

    expect(
      screen.getByRole("heading", { name: /are you 18\+\?/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /yes/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /no/i })).toBeInTheDocument();
    expect(screen.getByAltText("Otter Beer")).toBeInTheDocument();
  });

  it("sets verification in localStorage and cookie on clicking YES", () => {
    const onVerified = jest.fn();
    render(
      <AgeVerificationGate isStandalone={false} onVerified={onVerified} />
    );

    const yesBtn = screen.getByRole("button", { name: /yes/i });
    fireEvent.click(yesBtn);

    expect(localStorage.getItem("otter_age_verified")).toBe("true");
    expect(document.cookie).toContain("otter_age_verified=true");
    expect(onVerified).toHaveBeenCalledTimes(1);
  });

  it("shows responsible drinking restriction screen on clicking NO", () => {
    render(<AgeVerificationGate isStandalone={true} />);

    const noBtn = screen.getByRole("button", { name: /no/i });
    fireEvent.click(noBtn);

    expect(
      screen.getByRole("heading", { name: /access restricted/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/you must be 18 years of age or older/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /learn more/i })
    ).toHaveAttribute("href", "https://www.responsibility.org");
    expect(
      screen.getByRole("link", { name: /leave site/i })
    ).toHaveAttribute("href", "https://www.google.com");
  });

  it("allows retrying when clicking 'I made a mistake' in restriction screen", () => {
    render(<AgeVerificationGate isStandalone={true} />);

    // Deny first
    fireEvent.click(screen.getByRole("button", { name: /no/i }));
    expect(
      screen.getByRole("heading", { name: /access restricted/i })
    ).toBeInTheDocument();

    // Click retry
    fireEvent.click(
      screen.getByRole("button", { name: /i made a mistake/i })
    );
    expect(
      screen.getByRole("heading", { name: /are you 18\+\?/i })
    ).toBeInTheDocument();
  });
});
