import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "node:util";

// ─── Global test setup ─────────────────────────────────────────

// jest-environment-jsdom doesn't expose these Node globals by default;
// isomorphic-dompurify's jsdom fallback (used by HtmlSanitizer) needs them.
Object.assign(globalThis, { TextDecoder, TextEncoder });

// Silence console.error for expected error boundary tests
// Remove this if you want to see all console output during tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Warning: ReactDOM.render") ||
        args[0].includes("Warning: An update to"))
    ) {
      return;
    }
    originalError(...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// ─── Mock Next.js navigation ───────────────────────────────────
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  })),
  usePathname: jest.fn(() => "/"),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// ─── Mock next/headers ─────────────────────────────────────────
jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  })),
  headers: jest.fn(() => new Headers()),
}));

// ─── Browser APIs jsdom doesn't implement ──────────────────────
import { installMatchMediaMock, setPrefersReducedMotion } from "./tests/support/matchMedia";

installMatchMediaMock();

// HeroSection measures its stage with a ResizeObserver; jsdom ships none.
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

// Motion is allowed by default; tests opt into reduced motion explicitly.
afterEach(() => {
  setPrefersReducedMotion(false);
});
