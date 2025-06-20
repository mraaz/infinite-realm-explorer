
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthGuard } from "@/components/auth/AuthGuard";
import Index from "./pages/Index";
import Questionnaire from "./pages/Questionnaire";
import Results from "./pages/Results";
import FutureQuestionnaire from "./pages/FutureQuestionnaire";
import HabitBuilder from "./pages/HabitBuilder";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<AuthGuard><Index /></AuthGuard>} />
          <Route path="/questionnaire" element={<AuthGuard><Questionnaire /></AuthGuard>} />
          <Route path="/results" element={<AuthGuard><Results /></AuthGuard>} />
          <Route path="/future-questionnaire" element={<AuthGuard><FutureQuestionnaire /></AuthGuard>} />
          <Route path="/habit-builder" element={<AuthGuard><HabitBuilder /></AuthGuard>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
