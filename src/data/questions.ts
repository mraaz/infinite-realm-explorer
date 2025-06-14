
import { Target, PiggyBank, Heart, Users } from 'lucide-react';

export type Question = {
  pillar: 'Basics' | 'Career' | 'Finances' | 'Health' | 'Connections';
  question: string;
  type: 'text' | 'date' | 'multiple-choice' | 'slider';
  options?: string[];
  suggestions?: string[];
  sliderLabels?: { min: string; max: string };
};

export const questions: Question[] = [
  // Part 1: Basics
  {
    pillar: 'Basics',
    question: "What should we call you?",
    type: 'text',
  },
  {
    pillar: 'Basics',
    question: "What's your date of birth?",
    type: 'date',
  },
  // Part 2: Career
  {
    pillar: 'Career',
    question: "Which of these best describes your current work situation?",
    type: 'multiple-choice',
    options: ['Employed', 'Self-Employed/Freelancer', 'Business Owner', 'Student', 'Unemployed', 'Other'],
  },
  {
    pillar: 'Career',
    question: "On a scale of 1-10, how fulfilled do you feel in your current role?",
    type: 'slider',
    sliderLabels: { min: 'Drained', max: 'Energised' },
  },
  {
    pillar: 'Career',
    question: "What's your single biggest career goal for the next 5 years?",
    type: 'text',
    suggestions: ["Get a promotion", "Change careers", "Start a business"],
  },
  // We will add more questions later
];

export const pillarsInfo = {
  Career: { icon: Target, color: 'purple' },
  Finances: { icon: PiggyBank, color: 'blue' },
  Health: { icon: Heart, color: 'green' },
  Connections: { icon: Users, color: 'orange' },
};
