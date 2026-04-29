import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode, ReactElement } from "react";
import App from "../App";

// Mock react-router-dom
vi.mock("react-router-dom", () => ({
  BrowserRouter: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  Routes: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Route: ({ element }: { element: ReactElement }) => <div>{element}</div>,
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  useLocation: () => ({
    pathname: "/",
    search: "",
    state: null,
  }),
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
  useParams: () => ({ symbol: "AAPL" }),
}));

describe("App", () => {
  it("renders without crashing", () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>,
    );
    // The app should render some content
    expect(document.body).toBeInTheDocument();
  });
});
