import { Pillar } from "@/components/priority-ranking/types";

// Defines the structure for a single question
export interface Question {
  id: string;
  label: string;
  placeholder: string;
}

// Defines the structure for a set of questions for a specific focus
export interface QuestionSet {
  title: string;
  subtitle: string;
  questions: Question[];
}

// Type for the entire data structure
type QuestionnaireData = {
  [key in Pillar]: {
    main: QuestionSet;
    secondary: QuestionSet;
    maintenance: QuestionSet;
  };
};

// --- ALL QUESTIONS ARE STORED HERE ---
export const questionnaireData: QuestionnaireData = {
  Career: {
    main: {
      title: "Deep Dive: Career",
      subtitle:
        "Let's explore what success looks like in your career focus area.",
      questions: [
        {
          id: "q1",
          label:
            "Describe what your ideal future looks like in this area 5 years from now.",
          placeholder: "In 5 years from now, I want my career to be...",
        },
        {
          id: "q2",
          label: "What are the 3 most important outcomes you want to achieve?",
          placeholder: "e.g. 1. Outcome 1...",
        },
        {
          id: "q3",
          label:
            "Why is this important to you? What is your underlying motivation?",
          placeholder: "e.g. This will give me a sense of freedom...",
        },
      ],
    },
    secondary: {
      title: "Deep Dive: Career",
      subtitle:
        "Let's explore what success looks like in your career focus area.",
      questions: [
        {
          id: "q1",
          label:
            "Describe what your ideal future looks like in this area 5 years from now.",
          placeholder: "In 5 years from now, I want my career to be...",
        },
        {
          id: "q2",
          label: "What are the 3 most important outcomes you want to achieve?",
          placeholder: "e.g. 1. Outcome 1...",
        },
        {
          id: "q3",
          label:
            "Why is this important to you? What is your underlying motivation?",
          placeholder: "e.g. This will give me a sense of freedom...",
        },
      ],
    },
    maintenance: {
      title: "Maintenance: Career",
      subtitle:
        "Define the 'good enough' standard to keep your career in a healthy place.",
      questions: [
        {
          id: "m1",
          label:
            "What is the minimum standard for your career over the next five years?",
          placeholder: "e.g., Maintain my current role and performance...",
        },
      ],
    },
  },
  Financials: {
    main: {
      title: "Deep Dive: Financials",
      subtitle:
        "Let's explore what success looks like in your financial focus area.",
      questions: [
        {
          id: "q1",
          label: "Describe your ideal financial future in 5 years.",
          placeholder:
            "e.g., Having a certain amount in savings, being debt-free...",
        },
        {
          id: "q2",
          label: "What are the 3 most important financial outcomes?",
          placeholder: "1. Save for a house deposit...",
        },
        {
          id: "q3",
          label: "Why is financial stability important to you?",
          placeholder:
            "It represents security and the ability to support my family.",
        },
      ],
    },
    secondary: {
      title: "Deep Dive: Financials",
      subtitle:
        "Let's explore what success looks like in your financial focus area.",
      questions: [
        {
          id: "q1",
          label: "Describe your ideal financial future in 5 years.",
          placeholder:
            "e.g., Having a certain amount in savings, being debt-free...",
        },
        {
          id: "q2",
          label: "What are the 3 most important financial outcomes?",
          placeholder: "1. Save for a house deposit...",
        },
        {
          id: "q3",
          label: "Why is financial stability important to you?",
          placeholder:
            "It represents security and the ability to support my family.",
        },
      ],
    },
    maintenance: {
      title: "Maintenance: Financials",
      subtitle:
        "Define the 'good enough' standard to keep your finances in a healthy place.",
      questions: [
        {
          id: "m1",
          label:
            "What is the minimum standard for your finances over the next five years?",
          placeholder:
            "e.g., Sticking to a monthly budget and saving 10% of my income.",
        },
      ],
    },
  },
  Health: {
    main: {
      title: "Deep Dive: Health",
      subtitle:
        "Let's explore what success looks like in your health focus area.",
      questions: [
        {
          id: "q1",
          label: "Describe your ideal state of health in 5 years.",
          placeholder: "e.g., Feeling energetic, being able to run 5km...",
        },
        {
          id: "q2",
          label: "What are the 3 most important health outcomes?",
          placeholder: "1. Lower my blood pressure...",
        },
        {
          id: "q3",
          label: "Why is being healthy important to you?",
          placeholder: "To have a long and active life with my loved ones.",
        },
      ],
    },
    secondary: {
      title: "Deep Dive: Health",
      subtitle:
        "Let's explore what success looks like in your health focus area.",
      questions: [
        {
          id: "q1",
          label: "Describe your ideal state of health in 5 years.",
          placeholder: "e.g., Feeling energetic, being able to run 5km...",
        },
        {
          id: "q2",
          label: "What are the 3 most important health outcomes?",
          placeholder: "1. Lower my blood pressure...",
        },
        {
          id: "q3",
          label: "Why is being healthy important to you?",
          placeholder: "To have a long and active life with my loved ones.",
        },
      ],
    },
    maintenance: {
      title: "Maintenance: Health",
      subtitle:
        "Define the 'good enough' standard to keep your health in a healthy place.",
      questions: [
        {
          id: "m1",
          label:
            "What is the minimum standard for your health over the next five years?",
          placeholder:
            "e.g., Exercising twice a week and eating balanced meals.",
        },
      ],
    },
  },
  Connections: {
    main: {
      title: "Deep Dive: Connections",
      subtitle:
        "Let's explore what success looks like in your connections focus area.",
      questions: [
        {
          id: "q1",
          label:
            "Describe your ideal relationships with family and friends in 5 years.",
          placeholder: "e.g., Having deep, meaningful conversations...",
        },
        {
          id: "q2",
          label: "What are the 3 most important relationship outcomes?",
          placeholder: "1. Reconnect with an old friend...",
        },
        {
          id: "q3",
          label: "Why are strong connections important to you?",
          placeholder: "They provide a sense of belonging and support.",
        },
      ],
    },
    secondary: {
      title: "Deep Dive: Connections",
      subtitle:
        "Let's explore what success looks like in your connections focus area.",
      questions: [
        {
          id: "q1",
          label:
            "Describe your ideal relationships with family and friends in 5 years.",
          placeholder: "e.g., Having deep, meaningful conversations...",
        },
        {
          id: "q2",
          label: "What are the 3 most important relationship outcomes?",
          placeholder: "1. Reconnect with an old friend...",
        },
        {
          id: "q3",
          label: "Why are strong connections important to you?",
          placeholder: "They provide a sense of belonging and support.",
        },
      ],
    },
    maintenance: {
      title: "Maintenance: Connections",
      subtitle:
        "Define the 'good enough' standard to keep your connections in a healthy place.",
      questions: [
        {
          id: "m1",
          label:
            "What is the minimum standard for your connections over the next five years?",
          placeholder:
            "e.g., Calling my parents once a week and seeing friends once a month.",
        },
      ],
    },
  },
};
