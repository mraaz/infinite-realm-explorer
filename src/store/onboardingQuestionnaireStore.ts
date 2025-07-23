import { create } from "zustand";
import {
  generateSummary,
  getSummary,
  SummaryResponse,
} from "@/services/apiService";

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
  summary: SummaryResponse | null;
  summaryError: string | null;
  initializeQuestionnaire: (authToken?: string) => Promise<void>;
  submitAnswer: (
    questionId: string,
    answer: any,
    authToken?: string
  ) => Promise<void>;
  previousQuestion: (authToken?: string) => Promise<void>;
  saveGuestProgressAfterLogin: (authToken: string) => Promise<void>;
  fetchSummary: (authToken: string) => Promise<SummaryResponse | null>;
  clearSummary: () => void;
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
    summary: null,
    summaryError: null,

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
          set({
            pillarProgress: data.pillarProgress,
            finalScores: data.finalScores,
            isLoading: false,
          });

          if (authToken) {
            // Kick off the generation process. We don't need to wait for it.
            await generateSummary(updatedAnswers, authToken);
            // Immediately mark as completed to trigger navigation.
            set({ isCompleted: true });
          } else {
            set({
              summaryError:
                "You must be logged in to generate a personalized summary.",
            });
          }
        } else {
          set({
            currentQuestion: data.nextQuestion,
            pillarProgress: data.pillarProgress,
            currentQuestionIndex: data.currentQuestionIndex,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error("Failed to submit answer:", error);
        set({ isLoading: false });
      }
    },

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

    fetchSummary: async (authToken: string) => {
      if (get().summary) return get().summary;
      // Note: isLoading is handled by the component now, not the store,
      // to prevent the main questionnaire from showing a loader.
      try {
        const summaryData = await getSummary(authToken);
        set({ summary: summaryData });
        return summaryData;
      } catch (error) {
        set({ summaryError: (error as Error).message });
        return null;
      }
    },

    clearSummary: () => {
      set({ summary: null, isCompleted: false });
    },
  })
);
