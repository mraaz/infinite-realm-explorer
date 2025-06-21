
// Helper functions for basic score/insight generation
export const generateBasicScores = (answers: Record<string, any>) => {
  const pillars = { Career: 0, Finances: 0, Health: 0, Connections: 0 };
  
  Object.entries(answers).forEach(([key, value]) => {
    if (key.includes('career')) {
      pillars.Career += typeof value === 'number' ? value : 5;
    } else if (key.includes('financial')) {
      pillars.Finances += typeof value === 'number' ? value : 5;
    } else if (key.includes('health')) {
      pillars.Health += typeof value === 'number' ? value : 5;
    } else if (key.includes('connections')) {
      pillars.Connections += typeof value === 'number' ? value : 5;
    }
  });

  return pillars;
};

export const generateBasicInsights = (answers: Record<string, any>) => {
  return [
    {
      title: "Career Focus",
      description: "Based on your responses, you're building a strong foundation in your career."
    },
    {
      title: "Growth Mindset",
      description: "Your answers indicate a forward-thinking approach to personal development."
    }
  ];
};

export const generateBasicActions = (answers: Record<string, any>) => {
  return [
    {
      title: "Weekly Career Planning",
      description: "Set aside 30 minutes each week to plan your career goals."
    },
    {
      title: "Health Check-in",
      description: "Schedule regular health and wellness check-ins with yourself."
    }
  ];
};
