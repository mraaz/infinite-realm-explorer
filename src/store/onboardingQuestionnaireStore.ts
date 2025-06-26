import { create } from "zustand";

// Interfaces (Question, PillarProgress) remain the same...
export interface Question {
  id: string;
  question: string;
  type: "year" | "text" | "slider" | "multiple-choice" | "yes-no";
  section: string;
  options?: string[];
  sliderLabels?: { min: string; max: string };
  placeholder?: string;
}
export interface PillarProgress {
  career: number;
  financials: number;
  health: number;
  connections: number;
}

const GUEST_USER_FIRST_QUESTION: Question = {
  id: "dob",
  question: "To personalize your timeline, what year were you born?",
  type: "year",
  section: "basics",
};

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

// The URL is now just the root Function URL
const API_BASE_URL =
  "https://dndhqnh4ycs43x47snnbysmrgy0bafsb.lambda-url.us-east-1.on.aws/";

export const useOnboardingQuestionnaireStore = create<QuestionnaireState>(
  (set, get) => ({
    // Initial state is unchanged...
    currentQuestion: null,
    answers: {},
    isLoading: true,
    isCompleted: false,
    finalScores: null,
    pillarProgress: { career: 0, financials: 0, health: 0, connections: 0 },

    initializeQuestionnaire: async (authToken) => {
      if (authToken) {
        set({ isLoading: true });
        try {
          // --- MODIFIED --- No longer calling `/state`
          const response = await fetch(API_BASE_URL, {
            method: "POST", // Changed to POST to send a body
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ action: "getState" }), // Send action in body
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
        // Guest logic is unchanged and correct
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
        // --- MODIFIED --- No longer calling `/answer`
        const response = await fetch(API_BASE_URL, {
          method: "POST",
          headers,
          // --- MODIFIED --- Send action and payload together
          body: JSON.stringify({
            action: "submitAnswer",
            payload: { questionId, answer },
          }),
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
        // --- MODIFIED --- No longer calling `/save-progress`
        await fetch(API_BASE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          // --- MODIFIED --- Send action and payload together
          body: JSON.stringify({
            action: "saveProgress",
            payload: { answers },
          }),
        });
        get().initializeQuestionnaire(authToken);
      } catch (error) {
        console.error("Failed to save guest progress:", error);
      }
    },
  })
);
