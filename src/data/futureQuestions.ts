
export const deepDiveQuestions: Record<string, { pillar: string, questions: string[] }> = {
  career: {
    pillar: 'Career',
    questions: [
      "In 5 years, what does 'success' in your career look like in one sentence?",
      "What one new skill or qualification would make the biggest difference in getting there?",
      "Describe your ideal work-life balance. What does a perfect week look like?",
    ]
  },
  financials: {
    pillar: 'Financials',
    questions: [
      "What financial milestone in 5 years would make you feel truly secure?",
      "To achieve this, what's the biggest change you're willing to make to your spending or earning habits?",
      "Beyond security, what's one big-ticket item or experience you'd love to be able to afford, guilt-free?",
    ]
  },
  health: {
    pillar: 'Health',
    questions: [
      "Picture yourself in 5 years. How do you want to feel physically and mentally on a typical day?",
      "What is the single most important health habit you want to become second nature?",
      "What physical achievement, big or small, would you be most proud of?",
    ]
  },
  connections: {
    pillar: 'Connections',
    questions: [
      "In 5 years, what kind of social life genuinely energises you?",
      "What kind of person do you aspire to be for the most important people in your life?",
      "Is there a specific relationship (personal or professional) you want to invest in building or repairing over the next 5 years?",
    ]
  },
};

export const maintenanceQuestions: Record<string, { pillar: string, question: string }> = {
  career: {
    pillar: 'Career',
    question: "To support your other life goals, what does a 'good enough' career look like? What is the absolute minimum you need from your work?"
  },
  financials: {
    pillar: 'Financials',
    question: "What does 'not having to worry about money' mean to you on a practical level? What is the minimum financial baseline you need to feel secure enough to pursue your main goals?"
  },
  health: {
    pillar: 'Health',
    question: "What is the non-negotiable, minimum level of health and energy you need to function well and chase your primary ambitions? What is one habit you must maintain?"
  },
  connections: {
    pillar: 'Connections',
    question: "To feel supported, what is the minimum level of social connection you need? What does that look like on a weekly or monthly basis?"
  },
};

