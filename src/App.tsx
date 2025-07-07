
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import PulseCheck from '@/pages/PulseCheck';
import Results from '@/pages/Results';
import SharedResults from '@/pages/SharedResults';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/pulse-check" element={<PulseCheck />} />
          <Route path="/results" element={<Results />} />
          <Route path="/shared/:shareToken" element={<SharedResults />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
