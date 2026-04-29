import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "../App";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

describe("App routing", () => {
  const originalUrl = window.location.href;

  beforeEach(() => {
    window.history.pushState({}, "", "/missing-route");
  });

  afterEach(() => {
    window.history.pushState({}, "", originalUrl);
  });

  it("renders the not-found route with a link back to instruments", async () => {
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Page Not Found")).toBeInTheDocument();

    const backLink = screen.getByRole("link", { name: "Go to Instruments" });
    expect(backLink).toHaveAttribute("href", "/");
  });
});
