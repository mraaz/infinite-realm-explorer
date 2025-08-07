// src/App.tsx
import { Suspense, lazy, useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { QuestionnaireBoundary } from "./components/error-boundaries/QuestionnaireBoundary";
import { ResultsBoundary } from "./components/error-boundaries/ResultsBoundary";
import { AuthBoundary } from "./components/error-boundaries/AuthBoundary";
import PageLoading from "./components/ui/page-loading";
import { Toaster } from "@/components/ui/toaster";
import { initAnalytics, trackPageView } from "./utils/analytics";

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

// Analytics tracking component
const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <AuthProvider>
        <BrowserRouter>
          <AnalyticsTracker />
          <Suspense fallback={<PageLoading />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route
                path="/onboarding-questionnaire"
                element={
                  <QuestionnaireBoundary>
                    <OnboardingQuestionnaire />
                  </QuestionnaireBoundary>
                }
              />
              <Route
                path="/self-discovery-summary"
                element={<SelfDiscoverySummary />}
              />
              <Route 
                path="/results" 
                element={
                  <ResultsBoundary>
                    <Results />
                  </ResultsBoundary>
                }
              />
              <Route
                path="/future-questionnaire"
                element={
                  <QuestionnaireBoundary>
                    <FutureQuestionnaire />
                  </QuestionnaireBoundary>
                }
              />
              <Route path="/habit-builder" element={<HabitBuilder />} />
              <Route path="/pulse-check" element={<PulseCheck />} />
              <Route
                path="/pulse-check-results"
                element={
                  <ResultsBoundary>
                    <PulseCheckResults />
                  </ResultsBoundary>
                }
              />
              <Route path="/shared/:shareToken" element={<SharedResults />} />
              <Route path="/changelog" element={<Changelog />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route 
                path="/auth/callback" 
                element={
                  <AuthBoundary>
                    <AuthCallback />
                  </AuthBoundary>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
