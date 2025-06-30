
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import Index from '@/pages/Index';
import PageLoading from '@/components/ui/page-loading';
import { lazy, Suspense } from 'react';
import './App.css';

// Lazy load heavy pages to reduce initial bundle size
const OnboardingQuestionnaire = lazy(() => import('@/pages/OnboardingQuestionnaire'));
const Results = lazy(() => import('@/pages/Results'));
const FutureQuestionnaire = lazy(() => import('@/pages/FutureQuestionnaire'));
const HabitBuilder = lazy(() => import('@/pages/HabitBuilder'));
const AuthCallback = lazy(() => import('@/pages/AuthCallback'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
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
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
