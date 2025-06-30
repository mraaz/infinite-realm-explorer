// src/pages/index.tsx

import Header from "@/components/Header";
import PillarCardWithPopover from "@/components/PillarCardWithPopover"; // Correctly import the new component
import QuestionnaireLoginModal from "@/components/QuestionnaireLoginModal";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const pillars = [
  {
    icon: (
      <svg
        className="w-7 h-7 text-purple-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2 2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        ></path>
      </svg>
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
      <svg
        className="w-7 h-7 text-blue-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1m0-1V4m0 2.01M18 10a6 6 0 11-12 0 6 6 0 0112 0z"
        ></path>
      </svg>
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
      <svg
        className="w-7 h-7 text-emerald-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        ></path>
      </svg>
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
      <svg
        className="w-7 h-7 text-amber-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        ></path>
      </svg>
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
      navigate("/questionnaire");
    } else {
      setShowLoginModal(true);
    }
  };

  const handleContinueAsGuest = () => {
    setShowLoginModal(false);
    navigate("/questionnaire?guest=true");
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
              Take our quick assessment and unlock your personalised life
              insights.
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
