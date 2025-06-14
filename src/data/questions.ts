
import { Target, PiggyBank, Heart, Users, LucideIcon } from 'lucide-react';

export type Pillar = 'Career' | 'Finances' | 'Health' | 'Connections';

export type Question = {
  id: string;
  pillar: 'Basics' | Pillar;
  question: string;
  type: 'text' | 'date' | 'multiple-choice' | 'slider' | 'number';
  options?: string[];
  suggestions?: string[];
  sliderLabels?: { min: string; max: string };
  isOptional?: boolean;
};

export const questions: Question[] = [
  // Part 1: Basics
  {
    id: 'name',
    pillar: 'Basics',
    question: "What should we call you?",
    type: 'text',
  },
  {
    id: 'dob',
    pillar: 'Basics',
    question: "What's your date of birth?",
    type: 'date',
  },
  // Part 2: Career
  {
    id: 'career_situation',
    pillar: 'Career',
    question: "Which of these best describes your current work situation?",
    type: 'multiple-choice',
    options: ['Employed', 'Self-Employed/Freelancer', 'Business Owner', 'Student', 'Unemployed', 'Other'],
  },
  {
    id: 'career_challenge_follow_up',
    pillar: 'Career',
    question: "What's your biggest challenge right now?",
    type: 'multiple-choice',
    options: ['Finding Clients', 'Unstable Income', 'Isolation', 'Work-Life Balance'],
  },
  {
    id: 'career_fulfillment',
    pillar: 'Career',
    question: "On a scale of 1-10, how fulfilled do you feel in your current role?",
    type: 'slider',
    sliderLabels: { min: 'Drained', max: 'Energised' },
  },
  {
    id: 'career_hours',
    pillar: 'Career',
    question: "On average, how many hours do you work per week?",
    type: 'number',
    isOptional: true,
  },
  {
    id: 'career_goal',
    pillar: 'Career',
    question: "What's your single biggest career goal for the next 5 years?",
    type: 'text',
    isOptional: true,
    suggestions: ["Get a promotion", "Change careers", "Start a business"],
  },
  // Part 3: Finances
  {
    id: 'financial_situation',
    pillar: 'Finances',
    question: "Which statement best describes your financial situation?",
    type: 'multiple-choice',
    options: ['Living paycheque to paycheque', 'Comfortable, but not saving', 'Saving consistently', 'Financially secure'],
  },
  {
    id: 'financial_reason_follow_up',
    pillar: 'Finances',
    question: "What's the main reason for that?",
    type: 'multiple-choice',
    options: ['High Cost of Living', 'Managing Debt', 'Income is Too Low', 'Spending Habits'],
  },
  {
    id: 'financial_confidence',
    pillar: 'Finances',
    question: "On a scale of 1-10, how confident do you feel about your financial future?",
    type: 'slider',
    sliderLabels: { min: 'Stressed', max: 'Confident' },
  },
  {
    id: 'financial_savings_percentage',
    pillar: 'Finances',
    question: "Roughly, what percentage of your income are you able to save or invest each month?",
    type: 'multiple-choice',
    isOptional: true,
    options: ['0%', '1-5%', '5-10%', '10-20%', '20%+'],
  },
  {
    id: 'financial_goal',
    pillar: 'Finances',
    question: "What's your single biggest financial goal for the next 5 years?",
    type: 'text',
    isOptional: true,
    suggestions: ["Save for a home deposit", "Pay off debt", "Build an emergency fund"],
  },
  // Part 4: Health
  {
    id: 'health_activity',
    pillar: 'Health',
    question: "On average, how many days a week do you get at least 30 minutes of moderate-intensity physical activity?",
    type: 'number',
  },
  {
    id: 'health_barrier_follow_up',
    pillar: 'Health',
    question: "What's the main barrier for you?",
    type: 'multiple-choice',
    options: ['Not enough time', 'Not enough energy', 'I don\'t enjoy it', 'It\'s too expensive'],
  },
  {
    id: 'health_energy_levels',
    pillar: 'Health',
    question: "On a scale of 1-10, how would you rate your typical energy levels?",
    type: 'slider',
    sliderLabels: { min: 'Exhausted', max: 'Full of energy' },
  },
  {
    id: 'health_sleep',
    pillar: 'Health',
    question: "On average, how many hours of sleep do you get per night?",
    type: 'number',
    isOptional: true,
  },
  {
    id: 'health_goal',
    pillar: 'Health',
    question: "What's your single biggest health goal for the next 5 years?",
    type: 'text',
    isOptional: true,
    suggestions: ["Lose weight", "Build strength", "Improve my diet", "Run a half-marathon"],
  },
  // Part 5: Connections
  {
    id: 'connections_belonging',
    pillar: 'Connections',
    question: "On a scale of 1-10, how would you rate your sense of belonging and community?",
    type: 'slider',
    sliderLabels: { min: 'Isolated', max: 'Strongly Connected' },
  },
  {
    id: 'connections_priority_follow_up',
    pillar: 'Connections',
    question: "Is improving this a priority for you right now?",
    type: 'multiple-choice',
    options: ['Yes, it\'s a focus', 'I think about it', 'Not right now'],
  },
  {
    id: 'connections_quality_time',
    pillar: 'Connections',
    question: "How many hours a week do you dedicate to quality time with friends, family or a partner?",
    type: 'multiple-choice',
    options: ['0-2 hours', '2-5 hours', '5-10 hours', '10+ hours'],
  },
  {
    id: 'connections_investment',
    pillar: 'Connections',
    question: "Which of these relationships do you most want to invest in right now?",
    type: 'multiple-choice',
    isOptional: true,
    options: ['Partner', 'Family', 'Friendships', 'Professional Network'],
  },
  {
    id: 'connections_goal',
    pillar: 'Connections',
    question: "What's your single biggest relationship goal for the next 5 years?",
    type: 'text',
    isOptional: true,
    suggestions: ["Find a life partner", "Deepen friendships", "Reconnect with family"],
  },
];


export const pillarsInfo: Record<Pillar, { icon: LucideIcon; color: string; }> = {
  Career: { icon: Target, color: 'purple' },
  Finances: { icon: PiggyBank, color: 'blue' },
  Health: { icon: Heart, color: 'green' },
  Connections: { icon: Users, color: 'orange' },
};
