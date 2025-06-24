
import { create } from 'zustand';

type OnboardingQuestionnaireState = {
  currentQuestionIndex: number;
  answers: Record<string, any>;
  actions: {
    nextQuestion: () => void;
    previousQuestion: () => void;
    answerQuestion: (questionId: string, answer: any) => void;
  };
};

export const useOnboardingQuestionnaireStore = create<OnboardingQuestionnaireState>((set, get) => ({
  currentQuestionIndex: 0,
  answers: {},
  actions: {
    nextQuestion: () => {
      set(state => ({
        currentQuestionIndex: state.currentQuestionIndex + 1,
      }));
    },
    previousQuestion: () => {
      set(state => ({
        currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
      }));
    },
    answerQuestion: (questionId, answer) => {
      set(state => ({
        answers: { ...state.answers, [questionId]: answer },
      }));
    },
  },
}));
