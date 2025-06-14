
export type FutureSelfArchetype = {
  title: string;
  description: string;
};

export type PillarArchetypes = {
  prompt: string;
  options: FutureSelfArchetype[];
};

export const futureSelfArchetypes: Record<string, PillarArchetypes> = {
  health: {
    prompt: "Which of these identities best captures the healthy person you want to become?",
    options: [
      { title: "The Resilient Athlete", description: "Implying strength, consistency, and pushing limits" },
      { title: "The Energetic Person", description: "Implying vitality, good sleep, and daily movement" },
      { title: "The Mindful Eater", description: "Implying a focus on nutrition, presence, and body awareness" },
    ],
  },
  career: {
    prompt: "Which professional identity are you working towards?",
    options: [
      { title: "The Strategic Leader", description: "Implying mentorship, big-picture thinking" },
      { title: "The Focused Craftsman", description: "Implying deep work, skill mastery" },
      { title: "The Connected Networker", description: "Implying relationship-building, communication" },
    ],
  },
  financials: {
    prompt: "Which financial identity will bring you peace of mind?",
    options: [
      { title: "The Confident Investor", description: "Implying growth, calculated risks, long-term vision" },
      { title: "The Secure Planner", description: "Implying stability, budgeting, safety nets" },
      { title: "The Mindful Spender", description: "Implying value-alignment, anti-consumerism, conscious choices" },
    ],
  },
  connections: {
    prompt: "Which social identity best represents your ideal self?",
    options: [
      { title: "The Deep Connector", description: "Fostering a few meaningful, deep relationships." },
      { title: "The Community Builder", description: "Bringing people together and creating groups." },
      { title: "The Supportive Friend", description: "Being a reliable and present force in your circle." },
    ],
  },
};
