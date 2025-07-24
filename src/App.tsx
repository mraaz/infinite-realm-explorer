// src/App.tsx
import { Suspense, lazy } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import PageLoading from "./components/ui/page-loading";
import { Toaster } from "@/components/ui/toaster";

// --- DEBUGGING: Import Index directly to find hidden errors ---
import Index from "./pages/Index";

// Lazy load all pages for better performance
const OnboardingQuestionnaire = lazy(
  () => import("./pages/OnboardingQuestionnaire")
);
const Results = lazy(() => import("./pages/Results"));
const FutureQuestionnaire = lazy(() => import("./pages/FutureQuestionnaire"));
const HabitBuilder = lazy(() => import("./pages/HabitBuilder"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const PulseCheck = lazy(() => import("./pages/PulseCheck"));
const SharedResults = lazy(() => import("./pages/SharedResults"));
const Changelog = lazy(() => import("./pages/Changelog"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PulseCheckResults = lazy(
  () => import("./components/pulse-check/PulseCheckResults")
);
// --- NEW: Import the summary page ---
const SelfDiscoverySummary = lazy(() => import("./pages/SelfDiscoverySummary"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoading />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route
                path="/onboarding-questionnaire"
                element={<OnboardingQuestionnaire />}
              />
              {/* --- NEW: Add the route for the summary page --- */}
              <Route
                path="/self-discovery-summary"
                element={<SelfDiscoverySummary />}
              />
              <Route path="/results" element={<Results />} />
              <Route
                path="/future-questionnaire"
                element={<FutureQuestionnaire />}
              />
              <Route path="/habit-builder" element={<HabitBuilder />} />
              <Route path="/pulse-check" element={<PulseCheck />} />
              <Route
                path="/pulse-check-results"
                element={<PulseCheckResults />}
              />
              <Route path="/shared/:shareToken" element={<SharedResults />} />
              <Route path="/changelog" element={<Changelog />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
