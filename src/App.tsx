
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import PageLoading from "./components/ui/page-loading";

// Lazy load all pages for better performance
const Index = lazy(() => import("./pages/Index"));
const OnboardingQuestionnaire = lazy(() => import("./pages/OnboardingQuestionnaire"));
const Results = lazy(() => import("./pages/Results"));
const FutureQuestionnaire = lazy(() => import("./pages/FutureQuestionnaire"));
const HabitBuilder = lazy(() => import("./pages/HabitBuilder"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
              <Route path="/onboarding-questionnaire" element={<OnboardingQuestionnaire />} />
              <Route path="/results" element={<Results />} />
              <Route path="/future-questionnaire" element={<FutureQuestionnaire />} />
              <Route path="/habit-builder" element={<HabitBuilder />} />
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
