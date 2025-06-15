
export interface FutureQuestion {
  id: string;
  pillar: 'Career' | 'Finances' | 'Health' | 'Connections';
  type: 'deep_dive' | 'maintenance';
  question: string;
  placeholder?: string;
}

export const futureQuestions: FutureQuestion[] = [
  // Deep Dive
  {
    id: 'career_deep_1',
    pillar: 'Career',
    type: 'deep_dive',
    question: "In 5 years, what does 'success' in your career look like in one sentence?",
    placeholder: "e.g., 'Leading a team,' 'Running my own successful business,' 'Being a recognised expert in my field.'",
  },
  {
    id: 'career_deep_2',
    pillar: 'Career',
    type: 'deep_dive',
    question: 'What one new skill or qualification would make the biggest difference in getting there?',
    placeholder: "e.g., 'A certification in project management.'",
  },
  {
    id: 'career_deep_3',
    pillar: 'Career',
    type: 'deep_dive',
    question: 'Describe your ideal work-life balance. What does a perfect week look like?',
    placeholder: "e.g., 'Working 4 days a week, with Fridays for creative projects.'",
  },
  {
    id: 'finances_deep_1',
    pillar: 'Finances',
    type: 'deep_dive',
    question: 'What financial milestone in 5 years would make you feel truly secure?',
    placeholder: "e.g., 'Having $50k in savings,' 'Being completely debt-free,' 'Buying my first property.'",
  },
  {
    id: 'finances_deep_2',
    pillar: 'Finances',
    type: 'deep_dive',
    question: "To achieve this, what's the biggest change you're willing to make to your spending or earning habits?",
    placeholder: "e.g., 'Automating 20% of my income into savings.'",
  },
  {
    id: 'finances_deep_3',
    pillar: 'Finances',
    type: 'deep_dive',
    question: "Beyond security, what's one big-ticket item or experience you'd love to be able to afford, guilt-free?",
    placeholder: "e.g., 'A trip to Japan,' 'A down payment for a house.'",
  },
  {
    id: 'health_deep_1',
    pillar: 'Health',
    type: 'deep_dive',
    question: 'Picture yourself in 5 years. How do you want to feel physically and mentally on a typical day?',
    placeholder: "e.g., 'Energetic and clear-headed,' 'Strong and capable,' 'Calm and resilient.'",
  },
  {
    id: 'health_deep_2',
    pillar: 'Health',
    type: 'deep_dive',
    question: 'What is the single most important health habit you want to become second nature?',
    placeholder: "e.g., 'Exercising 3 times a week,' 'Meditating daily.'",
  },
  {
    id: 'health_deep_3',
    pillar: 'Health',
    type: 'deep_dive',
    question: 'What physical achievement, big or small, would you be most proud of?',
    placeholder: "e.g., 'Running 10k,' 'Hiking a major trail,' 'Simply feeling comfortable and confident in my body.'",
  },
  {
    id: 'connections_deep_1',
    pillar: 'Connections',
    type: 'deep_dive',
    question: 'In 5 years, what kind of social life genuinely energises you?',
    placeholder: "e.g., 'A few deep, meaningful friendships,' 'A large and active social network,' 'More quality time with family.'",
  },
  {
    id: 'connections_deep_2',
    pillar: 'Connections',
    type: 'deep_dive',
    question: 'What kind of person do you aspire to be for the most important people in your life?',
    placeholder: "e.g., 'A supportive partner,' 'An inspiring mentor.'",
  },
  {
    id: 'connections_deep_3',
    pillar: 'Connections',
    type: 'deep_dive',
    question: 'Is there a specific relationship (personal or professional) you want to invest in building or repairing over the next 5 years?',
    placeholder: "e.g., 'My relationship with my sibling,' 'My network in my industry.'",
  },
  // Maintenance
  {
    id: 'career_maintenance_1',
    pillar: 'Career',
    type: 'maintenance',
    question: "To support your other life goals, what does a 'good enough' career look like? What is the absolute minimum you need from your work?",
    placeholder: "e.g., 'A stable income,' 'Low stress,' 'Flexible hours.'",
  },
  {
    id: 'finances_maintenance_1',
    pillar: 'Finances',
    type: 'maintenance',
    question: "What does 'not having to worry about money' mean to you on a practical level? What is the minimum financial baseline you need to feel secure enough to pursue your main goals?",
    placeholder: "e.g., 'Having a 3-month emergency fund.'",
  },
  {
    id: 'health_maintenance_1',
    pillar: 'Health',
    type: 'maintenance',
    question: 'What is the non-negotiable, minimum level of health and energy you need to function well and chase your primary ambitions? What is one habit you must maintain?',
    placeholder: "e.g., 'Getting 7 hours of sleep per night.'",
  },
  {
    id: 'connections_maintenance_1',
    pillar: 'Connections',
    type: 'maintenance',
    question: 'To feel supported, what is the minimum level of social connection you need? What does that look like on a weekly or monthly basis?',
    placeholder: "e.g., 'A weekly call with family,' 'A monthly dinner with friends.'",
  },
];
