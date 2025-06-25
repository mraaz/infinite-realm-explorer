import { create } from "zustand";

// Define the shape of a single question
export interface Question {
  id: string;
  question: string;
  type: "year" | "text" | "slider" | "multiple-choice" | "yes-no";
  section: string;
  options?: string[];
  sliderLabels?: { min: string; max: string };
  placeholder?: string;
}

// Define the shape of the progress object for the ClarityRings
export interface PillarProgress {
  career: number;
  financials: number;
  health: number;
  connections: number;
}

// Hardcode the first question for guest users.
// This avoids an API call for non-logged-in users.
const GUEST_USER_FIRST_QUESTION: Question = {
  id: "dob",
  question: "`To better understand your life`, what year were you born?",
  type: "year",
  section: "basics",
};

// Define the complete shape of our state and actions
interface QuestionnaireState {
  currentQuestion: Question | null;
  answers: Record<string, any>;
  isLoading: boolean;
  isCompleted: boolean;
  finalScores: Record<string, any> | null;
  pillarProgress: PillarProgress;
  initializeQuestionnaire: (authToken?: string) => Promise<void>;
  submitAnswer: (
    questionId: string,
    answer: any,
    authToken?: string
  ) => Promise<void>;
  saveGuestProgressAfterLogin: (authToken: string) => Promise<void>;
}

// NOTE: You should move this to a .env file
const API_BASE_URL =
  "https://ffwkwcix01.execute-api.us-east-1.amazonaws.com/prod";

export const useOnboardingQuestionnaireStore = create<QuestionnaireState>(
  (set, get) => ({
    // Initial State
    currentQuestion: null,
    answers: {},
    isLoading: true, // Start in loading state until initialized
    isCompleted: false,
    finalScores: null,
    pillarProgress: { career: 0, financials: 0, health: 0, connections: 0 },

    // ACTIONS

    initializeQuestionnaire: async (authToken) => {
      // For a logged-in user, we fetch their state from the backend.
      if (authToken) {
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_BASE_URL}/state`, {
            method: "GET",
            headers: { Authorization: `Bearer ${authToken}` },
          });
          const data = await response.json();
          set({
            currentQuestion: data.nextQuestion,
            answers: data.answers || {},
            pillarProgress: data.pillarProgress || {
              career: 0,
              financials: 0,
              health: 0,
              connections: 0,
            },
            isLoading: false,
          });
        } catch (error) {
          console.error("Failed to initialize questionnaire for user:", error);
          set({ isLoading: false });
        }
      } else {
        // For a guest user, we simply set the hardcoded first question.
        set({
          currentQuestion: GUEST_USER_FIRST_QUESTION,
          answers: {},
          pillarProgress: {
            career: 0,
            financials: 0,
            health: 0,
            connections: 0,
          },
          isLoading: false,
          isCompleted: false,
          finalScores: null,
        });
      }
    },

    submitAnswer: async (questionId, answer, authToken) => {
      set((state) => ({
        answers: { ...state.answers, [questionId]: answer },
      }));
      set({ isLoading: true });

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      };

      try {
        const response = await fetch(`${API_BASE_URL}/answer`, {
          method: "POST",
          headers,
          body: JSON.stringify({ questionId, answer }),
        });
        const data = await response.json();

        if (data.status === "completed") {
          set({
            isCompleted: true,
            currentQuestion: null,
            finalScores: data.finalScores,
            pillarProgress: data.pillarProgress,
            isLoading: false,
          });
        } else {
          set({
            currentQuestion: data.nextQuestion,
            pillarProgress: data.pillarProgress,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error("Failed to submit answer:", error);
        set({ isLoading: false });
      }
    },

    saveGuestProgressAfterLogin: async (authToken: string) => {
      const answers = get().answers;
      if (Object.keys(answers).length === 0) return;

      try {
        await fetch(`${API_BASE_URL}/save-progress`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ answers }),
        });
        // After saving, we re-initialize to get the canonical server state.
        get().initializeQuestionnaire(authToken);
      } catch (error) {
        console.error("Failed to save guest progress:", error);
      }
    },
  })
);
