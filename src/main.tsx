import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HttpClient } from "@/lib/http-client";
import { queryClient } from "@/hooks/use-query-client";
import "./index.css";
import App from "./App.tsx";

HttpClient.initialize({
  baseURL: "https://api.binance.com",
  timeout: 15000,
  defaultHeaders: {
    Accept: "application/json",
  },
});

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </StrictMode>,
);
