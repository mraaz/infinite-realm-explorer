
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { AuthCallback } from "@/components/auth/AuthCallback";
import { SecureAuthGuard } from "@/components/auth/SecureAuthGuard";
import Index from "./pages/Index";
import Questionnaire from "./pages/Questionnaire";
import Results from "./pages/Results";
import Profile from "./pages/Profile";
import FutureQuestionnaire from "./pages/FutureQuestionnaire";
import HabitBuilder from "./pages/HabitBuilder";
import Auth from "./pages/Auth";
import AuthCallbackPage from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";
import PublicProfile from "./pages/PublicProfile";
import Settings from "./pages/Settings";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/" element={<Index />} />
            <Route path="/questionnaire" element={<Questionnaire />} />
            <Route path="/results" element={<Results />} />
            <Route path="/profile" element={<SecureAuthGuard><Profile /></SecureAuthGuard>} />
            <Route path="/settings" element={<SecureAuthGuard><Settings /></SecureAuthGuard>} />
            <Route path="/results/:slug" element={<PublicProfile />} />
            <Route path="/future-questionnaire" element={<SecureAuthGuard><FutureQuestionnaire /></SecureAuthGuard>} />
            <Route path="/habit-builder" element={<SecureAuthGuard><HabitBuilder /></SecureAuthGuard>} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
