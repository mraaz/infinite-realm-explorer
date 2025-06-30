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
  finances: number;
  health: number;
  connections: number;
}

// Hardcode the first question for guest users.
const GUEST_USER_FIRST_QUESTION: Question = {
  id: "dob",
  question: "To personalise your timeline, what year were you born?",
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
  currentQuestionIndex: number;
  initializeQuestionnaire: (authToken?: string) => Promise<void>;
  submitAnswer: (
    questionId: string,
    answer: any,
    authToken?: string
  ) => Promise<void>;
  // --- UPDATED --- Renamed for clarity and made async
  previousQuestion: (authToken?: string) => Promise<void>;
  saveGuestProgressAfterLogin: (authToken: string) => Promise<void>;
}

// Use the API Gateway URL
const API_BASE_URL =
  "https://ffwkwcix01.execute-api.us-east-1.amazonaws.com/prod";

export const useOnboardingQuestionnaireStore = create<QuestionnaireState>(
  (set, get) => ({
    // Initial State
    currentQuestion: null,
    answers: {},
    isLoading: true,
    isCompleted: false,
    finalScores: null,
    pillarProgress: { career: 0, finances: 0, health: 0, connections: 0 },
    currentQuestionIndex: 0,

    // ACTIONS

    initializeQuestionnaire: async (authToken) => {
      if (authToken) {
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_BASE_URL}/questionnaire/state`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          });
          const data = await response.json();
          set({
            currentQuestion: data.nextQuestion,
            answers: data.answers || {},
            pillarProgress: data.pillarProgress || {
              career: 0,
              finances: 0,
              health: 0,
              connections: 0,
            },
            // --- FIX --- Set index from the backend's response
            currentQuestionIndex:
              data.currentQuestionIndex ||
              Object.keys(data.answers || {}).length,
            isLoading: false,
          });
        } catch (error) {
          console.error("Failed to initialize questionnaire for user:", error);
          set({ isLoading: false });
        }
      } else {
        set({
          currentQuestion: GUEST_USER_FIRST_QUESTION,
          answers: {},
          pillarProgress: { career: 0, finances: 0, health: 0, connections: 0 },
          currentQuestionIndex: 0,
          isLoading: false,
          isCompleted: false,
          finalScores: null,
        });
      }
    },

    submitAnswer: async (questionId, answer, authToken) => {
      const updatedAnswers = { ...get().answers, [questionId]: answer };
      set({ answers: updatedAnswers, isLoading: true });

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      };

      try {
        const response = await fetch(`${API_BASE_URL}/questionnaire/answer`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            newAnswer: { questionId, answer },
            allAnswers: updatedAnswers,
          }),
        });
        const data = await response.json();

        if (data.status === "completed") {
          if (!authToken) {
            localStorage.setItem(
              "guestResults",
              JSON.stringify({
                finalScores: data.finalScores,
                pillarProgress: data.pillarProgress,
                answers: updatedAnswers,
              })
            );
          }
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
            // --- FIX --- Set the index from the backend's response
            currentQuestionIndex: data.currentQuestionIndex,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error("Failed to submit answer:", error);
        set({ isLoading: false });
      }
    },

    // --- THIS REPLACES your old goToPreviousQuestion function ---
    previousQuestion: async (authToken) => {
      const { currentQuestion, answers, currentQuestionIndex } = get();
      if (!currentQuestion || currentQuestionIndex === 0) return;

      set({ isLoading: true });

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      };

      try {
        const response = await fetch(`${API_BASE_URL}/questionnaire/previous`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            currentQuestionId: currentQuestion.id,
            allAnswers: answers,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to go to previous question");
        }

        const data = await response.json();

        set({
          currentQuestion: data.previousQuestion,
          pillarProgress: data.pillarProgress,
          answers: data.updatedAnswers,
          // --- FIX --- Set the index from the backend's response
          currentQuestionIndex: data.currentQuestionIndex,
          isLoading: false,
        });
      } catch (error) {
        console.error("Failed to go to previous question:", error);
        set({ isLoading: false });
      }
    },

    saveGuestProgressAfterLogin: async (authToken: string) => {
      const answers = get().answers;
      if (Object.keys(answers).length === 0) return;

      try {
        await fetch(`${API_BASE_URL}/questionnaire/save-progress`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ answers }),
        });
        get().initializeQuestionnaire(authToken);
      } catch (error) {
        console.error("Failed to save guest progress:", error);
      }
    },
  })
);
