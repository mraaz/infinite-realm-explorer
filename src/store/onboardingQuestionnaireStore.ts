import { create } from "zustand";

export interface Question {
  id: string;
  question: string;
  type: "year" | "text" | "slider" | "multiple-choice" | "yes-no";
  pillar: "Basics" | "Career" | "Financials" | "Health" | "Connections";
  options?: string[];
  sliderLabels?: { min: string; max: string };
  placeholder?: string;
}

// All questions are defined here and exported
export const questions: Question[] = [
  {
    id: "dob",
    question: "What year were you born?",
    type: "year",
    pillar: "Basics",
  },
  // --- All your questions go here ---
  {
    id: "career_fulfillment_q1",
    question: "On a typical day, how energised do you feel by your work?",
    type: "slider",
    pillar: "Career",
    sliderLabels: { min: "Drained", max: "Energised" },
  },
  {
    id: "career_fulfillment_q2",
    question:
      "How well does your role align with your personal values and interests?",
    type: "slider",
    pillar: "Career",
    sliderLabels: { min: "Not at all", max: "Perfectly" },
  },
  // ... Paste the rest of your full question list here
];

interface QuestionnaireState {
  currentQuestionIndex: number;
  answers: Record<string, any>;
  answerQuestion: (questionId: string, answer: any) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
}

export const useOnboardingQuestionnaireStore = create<QuestionnaireState>(
  (set) => ({
    currentQuestionIndex: 0,
    answers: {},
    answerQuestion: (questionId, answer) => {
      set((state) => ({
        answers: { ...state.answers, [questionId]: answer },
      }));
    },
    nextQuestion: () => {
      set((state) => ({
        currentQuestionIndex: Math.min(
          state.currentQuestionIndex + 1,
          questions.length
        ),
      }));
    },
    previousQuestion: () => {
      set((state) => ({
        currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
      }));
    },
  })
);
