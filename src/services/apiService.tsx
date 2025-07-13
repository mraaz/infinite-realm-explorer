import { Pillar } from "@/components/priority-ranking/types";

// --- Type Definitions ---

interface Priorities {
  mainFocus: Pillar;
  secondaryFocus: Pillar;
  maintenance: Pillar[];
}

// Represents the structure of the `answers` object, which will hold the chat state
// Using 'any' provides flexibility for storing conversation history, scores, etc.
type AnswersState = any;

// This is the shape of the full user record in your 'futureselfquestionnaire' DynamoDB table
export interface QuestionnaireStatePayload {
  userId?: string; // The backend will handle this, but it's good practice to include it
  priorities: Priorities | null;
  answers: AnswersState;
}

// This is the payload sent to the AI for processing a single answer
export interface ProcessAnswerPayload {
  pillarName: Pillar;
  previousQuestion: string;
  userAnswer: string;
  // You could also include conversation_history here if needed in the future
}

// This is the expected JSON response from the AI processing endpoint
export interface AIResponse {
  isRelevant: boolean;
  score: number;
  nextQuestion: string | null;
  feedback: string | null;
}

// New interface for dialogue response from Supabase edge function
export interface DialogueResponse {
  heroMessage: string;
  doubtMessage: string;
}

// The base URL of your deployed API Gateway stage
const API_BASE_URL =
  "https://ffwkwcix01.execute-api.us-east-1.amazonaws.com/prod";

/**
 * Fetches the user's saved questionnaire state from the backend.
 * This includes their priorities and any saved chat progress.
 * @param {string} token - The user's JWT token for authentication.
 * @returns {Promise<QuestionnaireStatePayload>} The saved state object.
 */
export const getQuestionnaireState = async (
  token: string
): Promise<QuestionnaireStatePayload> => {
  const url = `${API_BASE_URL}/futureQuestionnaire/state`;

  console.log("Attempting to fetch questionnaire state...");

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Backend error while fetching state:", errorData);
      throw new Error(
        errorData.error || "Failed to fetch questionnaire state."
      );
    }

    const state = await response.json();
    console.log("Successfully fetched questionnaire state:", state);
    return state;
  } catch (error) {
    console.error(
      "An error occurred while fetching questionnaire state:",
      error
    );
    // Return a default empty state on error so the app doesn't crash
    return {
      priorities: null,
      answers: {},
    };
  }
};

/**
 * Saves the entire state of the questionnaire conversation to the backend.
 * @param {QuestionnaireStatePayload} payload - The complete questionnaire state object to be saved.
 * @param {string} token - The user's JWT token for authentication.
 * @returns {Promise<void>}
 */
export const saveQuestionnaireProgress = async (
  payload: QuestionnaireStatePayload,
  token: string
): Promise<void> => {
  const url = `${API_BASE_URL}/futureQuestionnaire/progress`;

  console.log("Saving questionnaire progress to backend:", payload);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Backend error while saving progress:", errorData);
      throw new Error(errorData.error || "Failed to save progress.");
    }

    console.log("Progress saved successfully.");
  } catch (error) {
    console.error("An error occurred while saving progress:", error);
    throw error;
  }
};

/**
 * Sends a user's answer to the backend for AI processing.
 * @param {ProcessAnswerPayload} payload - The context of the current conversation turn.
 * @param {string} token - The user's JWT token for authentication.
 * @returns {Promise<AIResponse>} The structured response from the AI.
 */
export const processChatAnswer = async (
  payload: ProcessAnswerPayload,
  token: string
): Promise<AIResponse> => {
  const url = `${API_BASE_URL}/futureQuestionnaire/process-answer`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to process answer.");
    }

    return await response.json();
  } catch (error) {
    console.error("An error occurred while processing answer:", error);
    throw error;
  }
};

/**
 * Generates Future Self vs Inner Doubt dialogue using Supabase edge function
 */
export const generateDialogue = async (
  pillar: Pillar,
  questionNumber: number,
  totalQuestions: number,
  focusType: 'main' | 'secondary' | 'maintenance',
  previousAnswers: any = {}
): Promise<DialogueResponse> => {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    
    const { data, error } = await supabase.functions.invoke('future-self-dialogue', {
      body: {
        pillar,
        questionNumber,
        totalQuestions,
        focusType,
        previousAnswers,
        isFirstQuestion: questionNumber === 1
      }
    });

    if (error) {
      console.error('Error calling future-self-dialogue function:', error);
      throw new Error(error.message || 'Failed to generate dialogue');
    }

    return data as DialogueResponse;
  } catch (error) {
    console.error('Error in generateDialogue:', error);
    // Fallback dialogue
    return {
      heroMessage: `What does success in your ${pillar} area look like 5 years from now? Paint me a picture of your ideal scenario.`,
      doubtMessage: `But what if you're not capable of achieving that? What if you're setting yourself up for disappointment?`
    };
  }
};
