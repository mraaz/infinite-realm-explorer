
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import UpdateNotification from "@/components/pwa/UpdateNotification";
import OfflineIndicator from "@/components/pwa/OfflineIndicator";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          {navItems.map(({ to, page }) => (
            <Route key={to} path={to} element={page} />
          ))}
        </Routes>
        <InstallPrompt />
        <UpdateNotification />
        <OfflineIndicator />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
