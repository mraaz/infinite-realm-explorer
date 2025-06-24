
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import Index from '@/pages/Index';
import OnboardingQuestionnaire from '@/pages/OnboardingQuestionnaire';
import Results from '@/pages/Results';
import FutureQuestionnaire from '@/pages/FutureQuestionnaire';
import HabitBuilder from '@/pages/HabitBuilder';
import AuthCallback from '@/pages/AuthCallback';
import NotFound from '@/pages/NotFound';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/onboarding-questionnaire" element={<OnboardingQuestionnaire />} />
            <Route path="/results" element={<Results />} />
            <Route path="/future-questionnaire" element={<FutureQuestionnaire />} />
            <Route path="/habit-builder" element={<HabitBuilder />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
