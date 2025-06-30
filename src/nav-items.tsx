
import React from 'react';
import Index from '@/pages/Index';
import OnboardingQuestionnaire from '@/pages/OnboardingQuestionnaire';

export const navItems = [
  {
    title: "Home",
    to: "/",
    page: <Index />,
  },
  {
    title: "Questionnaire",
    to: "/questionnaire",
    page: <OnboardingQuestionnaire />,
  },
];
