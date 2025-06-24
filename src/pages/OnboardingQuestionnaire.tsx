
import React from 'react';
import Header from "@/components/Header";

const OnboardingQuestionnaire = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#16161a]">
      <Header />
      <main className="flex-grow flex flex-col items-center px-4 py-8 md:py-12">
        <div className="w-full max-w-5xl">
          <h1 className="text-3xl font-bold text-white text-center">
            Onboarding Questionnaire
          </h1>
          <p className="text-gray-400 text-center mt-4">
            Coming soon...
          </p>
        </div>
      </main>
    </div>
  );
};

export default OnboardingQuestionnaire;
