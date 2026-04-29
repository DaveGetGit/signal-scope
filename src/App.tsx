import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

const InstrumentsPage = lazy(() =>
  import("@/pages/instruments-page").then((module) => ({
    default: module.InstrumentsPage,
  })),
);

const InspectPage = lazy(() =>
  import("@/pages/inspect-page").then((module) => ({
    default: module.InspectPage,
  })),
);

function RouteFallback() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-slate-900" />
        <p className="mt-4 text-sm text-slate-600">Loading view...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<InstrumentsPage />} />
          <Route path="/instruments/:symbol" element={<InspectPage />} />
          <Route
            path="*"
            element={
              <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-slate-900 mb-4">
                    Page Not Found
                  </h1>
                  <p className="text-slate-600 mb-4">
                    The page you're looking for doesn't exist.
                  </p>
                  <Link
                    to="/"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-slate-900 hover:bg-slate-800 transition-colors"
                  >
                    Go to Instruments
                  </Link>
                </div>
              </div>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
