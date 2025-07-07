
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Landing from '@/pages/Landing';
import PulseCheck from '@/pages/PulseCheck';
import Results from '@/pages/Results';
import Auth from '@/pages/Auth';
import SharedResults from '@/pages/SharedResults';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/pulse-check" element={<PulseCheck />} />
          <Route path="/results" element={<Results />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/shared/:shareToken" element={<SharedResults />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
