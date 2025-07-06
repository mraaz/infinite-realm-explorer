// src/pages/index.tsx

import Header from "@/components/Header";
import PillarCardWithPopover from "@/components/PillarCardWithPopover"; // Correctly import the new component
import QuestionnaireLoginModal from "@/components/QuestionnaireLoginModal";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import careerIcon from '@/assets/career-icon.png';
import financeIcon from '@/assets/finance-icon.png';
import healthIcon from '@/assets/health-icon.png';
import connectionsIcon from '@/assets/connections-icon.png';

const pillars = [
  {
    icon: (
      <img src={careerIcon} alt="Career" className="w-7 h-7" />
    ),
    title: "Career",
    description: "Professional growth & goals",
    hoverBorderColor: "hover:border-purple-500",
    iconBgColor: "bg-purple-500/10",
    popoverContent: {
      title: "About Your Career Pillar",
      text: "This pillar analyses your current job satisfaction, skill development, and long-term professional aspirations to project your career trajectory.",
    },
  },
  {
    icon: (
      <img src={financeIcon} alt="Finances" className="w-7 h-7" />
    ),
    title: "Finances",
    description: "Wealth & financial security",
    hoverBorderColor: "hover:border-blue-500",
    iconBgColor: "bg-blue-500/10",
    popoverContent: {
      title: "About Your Finances Pillar",
      text: "Here we look at your income, savings, investments, and financial habits to forecast your path towards financial independence and security.",
    },
  },
  {
    icon: (
      <img src={healthIcon} alt="Health" className="w-7 h-7" />
    ),
    title: "Health",
    description: "Physical & mental wellbeing",
    hoverBorderColor: "hover:border-emerald-500",
    iconBgColor: "bg-emerald-500/10",
    popoverContent: {
      title: "About Your Health Pillar",
      text: "This pillar assesses your physical fitness, mental health, diet, and lifestyle choices to project your long-term wellbeing.",
    },
  },
  {
    icon: (
      <img src={connectionsIcon} alt="Connections" className="w-7 h-7" />
    ),
    title: "Connections",
    description: "Relationships & community",
    hoverBorderColor: "hover:border-amber-500",
    iconBgColor: "bg-amber-500/10",
    popoverContent: {
      title: "About Your Connections Pillar",
      text: "We evaluate the strength of your social bonds, family relationships, and community involvement to understand your support system.",
    },
  },
];

const Index = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleGetSnapshotClick = () => {
    if (isLoggedIn) {
      navigate("/onboarding-questionnaire");
    } else {
      setShowLoginModal(true);
    }
  };

  const handleContinueAsGuest = () => {
    setShowLoginModal(false);
    navigate("/onboarding-questionnaire?guest=true");
  };

  const handleModalOpenChange = (open: boolean) => {
    setShowLoginModal(open);
  };

  return (
    <div className="min-h-screen bg-[#16161a]">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Hero Section */}
        <section className="text-center mb-16 md:mb-24">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
            Discover Your{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              5-Year Future
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Get a personalised snapshot of where your life is heading. Our AI
            analyses your current situation across four key pillars to project
            your path forward.
          </p>
        </section>

        {/* Pillar Cards Section */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 md:mb-24">
          {pillars.map((pillar) => (
            <PillarCardWithPopover
              key={pillar.title}
              icon={pillar.icon}
              title={pillar.title}
              description={pillar.description}
              hoverBorderColor={pillar.hoverBorderColor}
              iconBgColor={pillar.iconBgColor}
              popoverContent={pillar.popoverContent}
            />
          ))}
        </section>

        {/* Call-to-Action Section */}
        <section className="flex justify-center">
          <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl ring-1 ring-white/10 text-center max-w-md">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to begin?
            </h3>
            <p className="text-gray-400 mb-6">
              Take our assessment and unlock your personalised life insights.
              This usually takes 5mins to complete.
            </p>

            <button
              onClick={handleGetSnapshotClick}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity duration-200 w-full mb-4"
            >
              Get Your Life Snapshot
            </button>

            <div className="flex justify-center space-x-4">
              <span className="bg-purple-500/10 text-purple-400 px-2 py-1 rounded-full text-xs font-medium">
                Powered by AI
              </span>
              <span className="bg-green-500/10 text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                Instant results
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-600 border-t border-gray-800">
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
