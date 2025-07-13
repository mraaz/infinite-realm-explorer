// src/pages/index.tsx

import Header from "@/components/Header";
import HeroVideoSection from "@/components/HeroVideoSection";
import PillarCardWithPopover from "@/components/PillarCardWithPopover"; // Correctly import the new component
import QuestionnaireLoginModal from "@/components/QuestionnaireLoginModal";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useChangelog } from "@/hooks/useChangelog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Plus, Edit, AlertTriangle, Trash2, Bug, Shield } from "lucide-react";
import careerIcon from "/lovable-uploads/17c46b5d-39d7-4366-a2b1-0ca119060118.png";
import financeIcon from "/lovable-uploads/093d4b1c-b1c4-428b-8c8e-304488447147.png";
import healthIcon from "/lovable-uploads/80bdf94e-e50a-400d-a2aa-1923772a5201.png";
import connectionsIcon from "/lovable-uploads/3167f89f-9cfc-4372-8b99-7c2474932863.png";

const pillars = [
  {
    icon: (
      <img
        src={careerIcon}
        alt="Career"
        className="w-7 h-7 object-contain filter brightness-110 contrast-110"
      />
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
      <img
        src={financeIcon}
        alt="Finances"
        className="w-7 h-7 object-contain filter brightness-110 contrast-110"
      />
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
      <img
        src={healthIcon}
        alt="Health"
        className="w-7 h-7 object-contain filter brightness-110 contrast-110"
      />
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
      <img
        src={connectionsIcon}
        alt="Connections"
        className="w-7 h-7 object-contain filter brightness-110 contrast-110"
      />
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
  const [modalSource, setModalSource] = useState<"snapshot" | "pulse">(
    "snapshot"
  );
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const { changelog, loading: changelogLoading } = useChangelog(1);

  const typeIcons = {
    added: Plus,
    changed: Edit,
    deprecated: AlertTriangle,
    removed: Trash2,
    fixed: Bug,
    security: Shield,
  };

  const typeColors = {
    added: "bg-green-500/10 text-green-400 border-green-500/20",
    changed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    deprecated: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    removed: "bg-red-500/10 text-red-400 border-red-500/20",
    fixed: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    security: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  };

  const handleGetSnapshotClick = () => {
    if (isLoggedIn) {
      navigate("/future-questionnaire");
    } else {
      setModalSource("snapshot");
      setShowLoginModal(true);
    }
  };

  const handlePulseCheckClick = () => {
    if (isLoggedIn) {
      navigate("/pulse-check");
    } else {
      setModalSource("pulse");
      setShowLoginModal(true);
    }
  };

  const handleContinueAsGuest = () => {
    setShowLoginModal(false);
    if (modalSource === "pulse") {
      navigate("/pulse-check?guest=true");
    } else {
      navigate("/onboarding-questionnaire?guest=true");
    }
  };

  const handleModalOpenChange = (open: boolean) => {
    setShowLoginModal(open);
  };

  return (
    <div className="min-h-screen bg-[#16161a]">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Hero Video Section */}
        <HeroVideoSection />

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
              Get your Life Snapshot
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Short on time? Start with a quick check-in instead.
            </p>

            <button
              onClick={handlePulseCheckClick}
              className="bg-transparent border border-purple-500/50 text-purple-400 font-semibold py-3 px-8 rounded-lg hover:border-purple-400 hover:text-purple-300 transition-all duration-200 w-full mb-4"
            >
              Take a 60-Second Pulse Check
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

      {/* Changelog Preview Section */}
      {!changelogLoading && changelog.length > 0 && (
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-800">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent mb-4">
              What's New
            </h2>
            <p className="text-gray-400">
              Latest updates and improvements to Infinite Game
            </p>
          </div>

          <div className="space-y-6 max-w-4xl mx-auto">
            {changelog.map((entry) => {
              const Icon = typeIcons[entry.type];
              return (
                <Card
                  key={entry.id}
                  className="border-gray-800 bg-gray-900/50 backdrop-blur-sm"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-white">
                        {entry.version}
                      </CardTitle>
                      <time className="text-sm text-gray-400">
                        {format(new Date(entry.release_date), "MMM dd, yyyy")}
                      </time>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge
                        className={`${
                          typeColors[entry.type]
                        } capitalize text-xs`}
                      >
                        <Icon className="h-3 w-3 mr-1" />
                        {entry.type}
                      </Badge>
                      <h3 className="font-semibold text-gray-200">
                        {entry.title}
                      </h3>
                    </div>
                    <p className="text-gray-400 text-sm">{entry.content}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/changelog"
              className="inline-flex items-center text-primary hover:text-primary-glow transition-colors"
            >
              View Full Changelog
              <svg
                className="ml-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-gray-600 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div>
              © {new Date().getFullYear()} Infinite Game. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <Link
                to="/changelog"
                className="hover:text-gray-400 transition-colors"
              >
                Changelog
              </Link>
              <Link
                to="/privacy"
                className="hover:text-gray-400 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="hover:text-gray-400 transition-colors"
              >
                Terms of Use
              </Link>
            </div>
          </div>
        </div>
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
