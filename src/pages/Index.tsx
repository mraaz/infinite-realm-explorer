
import Header from '@/components/Header';
import PillarCard from '@/components/PillarCard';
import CallToActionSection from '@/components/CallToActionSection';
import QuestionnaireLoginModal from '@/components/QuestionnaireLoginModal';
import { Target, PiggyBank, Heart, Users } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const pillars = [
  {
    icon: Target,
    title: 'Career',
    description: 'Professional growth & goals',
    borderColorClass: 'border-purple-500',
    iconColorClass: 'text-purple-600',
  },
  {
    icon: PiggyBank,
    title: 'Finances',
    description: 'Wealth & financial security',
    borderColorClass: 'border-blue-500',
    iconColorClass: 'text-blue-600',
  },
  {
    icon: Heart,
    title: 'Health',
    description: 'Physical & mental wellbeing',
    borderColorClass: 'border-green-500',
    iconColorClass: 'text-green-600',
  },
  {
    icon: Users,
    title: 'Connections',
    description: 'Relationships & community',
    borderColorClass: 'border-orange-500',
    iconColorClass: 'text-orange-600',
  },
];

const Index = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleGetSnapshotClick = () => {
    if (isLoggedIn) {
      // If user is already logged in, go directly to questionnaire
      navigate('/questionnaire');
    } else {
      // If not logged in, show the modal
      setShowLoginModal(true);
    }
  };

  const handleContinueAsGuest = () => {
    setShowLoginModal(false);
    navigate('/questionnaire');
  };

  const handleModalOpenChange = (open: boolean) => {
    setShowLoginModal(open);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <section className="text-center mb-16 md:mb-24">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 mb-4">
            Discover Your <span className="text-purple-600">5-Year Future</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Get a personalised snapshot of where your life is heading. Our AI
            analyses your current situation across four key pillars to project your
            path forward.
          </p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-16 md:mb-24">
          {pillars.map((pillar) => (
            <PillarCard
              key={pillar.title}
              icon={pillar.icon}
              title={pillar.title}
              description={pillar.description}
              borderColorClass={pillar.borderColorClass}
              iconColorClass={pillar.iconColorClass}
            />
          ))}
        </section>

        <section>
          <CallToActionSection onGetSnapshotClick={handleGetSnapshotClick} />
        </section>
      </main>
      <footer className="text-center py-6 text-sm text-gray-500 border-t border-gray-200">
        © {new Date().getFullYear()} Infinite Life. All rights reserved.
      </footer>

      <QuestionnaireLoginModal
        open={showLoginModal}
        onOpenChange={handleModalOpenChange}
        onContinueAsGuest={handleContinueAsGuest}
      />
    </div>
  );
};

export default Index;
