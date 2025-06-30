
import React from 'react';
import OnboardingQuestionnaire from '@/pages/OnboardingQuestionnaire';

export const navItems = [
  {
    title: "Questionnaire",
    to: "/questionnaire",
    page: <OnboardingQuestionnaire />,
  },
  {
    title: "Home",
    to: "/",
    page: <OnboardingQuestionnaire />, // Default to questionnaire for now
  },
];
