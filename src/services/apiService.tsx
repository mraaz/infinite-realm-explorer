import { Pillar } from "@/components/priority-ranking/types";

// --- Type Definitions ---

interface Priorities {
  mainFocus: Pillar;
  secondaryFocus: Pillar;
  maintenance: Pillar[];
}

export interface AnswersState {
  history: Array<{
    id: number;
    role: "ai" | "user" | "feedback";
    content: string;
  }>;
  scores: Record<Pillar, number>;
  questionCount: Record<Pillar, number>;
}

// This is the shape of the full user record in your 'futureselfquestionnaire' DynamoDB table
export interface QuestionnaireStatePayload {
  userId?: string;
  priorities: Priorities | null;
  answers: AnswersState;
  step?: number; // --- MODIFICATION: Added step to the payload ---
}

export interface ProcessAnswerPayload {
  pillarName: string;
  previousQuestion: string;
  userAnswer: string;
}

export interface AIResponse {
  isRelevant: boolean;
  nextQuestion?: string;
  feedback?: string;
  score: number;
}

// The base URL of your deployed API Gateway stage
const API_BASE_URL =
  "https://ffwkwcix01.execute-api.us-east-1.amazonaws.com/prod";

/**
 * Fetches the user's saved questionnaire state from the backend.
 * @param {string} token - The user's JWT token for authentication.
 * @returns {Promise<QuestionnaireStatePayload>} The saved state object.
 */
export const getQuestionnaireState = async (
  token: string
): Promise<QuestionnaireStatePayload> => {
  const url = `${API_BASE_URL}/futureQuestionnaire/state`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch questionnaire state.");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching questionnaire state:", error);
    return {
      priorities: null,
      answers: {
        history: [],
        scores: { Career: 0, Financials: 0, Health: 0, Connections: 0 },
        questionCount: { Career: 0, Financials: 0, Health: 0, Connections: 0 }
      },
      step: 1,
    };
  }
};

/**
 * Saves the entire state of the questionnaire conversation to the backend.
 * @param {QuestionnaireStatePayload} payload - The complete questionnaire state object to be saved.
 * @param {string} token - The user's JWT token for authentication.
 */
export const saveQuestionnaireProgress = async (
  payload: QuestionnaireStatePayload,
  token: string
): Promise<void> => {
  const url = `${API_BASE_URL}/futureQuestionnaire/progress`;

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
      throw new Error("Failed to save progress.");
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

export interface Blueprint {
  title: string;
  overallSummary: string;
  mainFocus: {
    pillar: Pillar;
    summary: string;
    actionableSteps: string[];
  };
  secondaryFocus: {
    pillar: Pillar;
    summary: string;
    actionableSteps: string[];
  };
}

/**
 * Sends the completed questionnaire state to the backend to generate the final blueprint.
 * @param {QuestionnaireStatePayload} payload - The final state of the conversation.
 * @param {string} token - The user's JWT token.
 * @returns {Promise<Blueprint>} The AI-generated blueprint.
 */
export const generateBlueprint = async (
  payload: QuestionnaireStatePayload,
  token: string
): Promise<Blueprint> => {
  const url = `${API_BASE_URL}/futureQuestionnaire/blueprint`;

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
      throw new Error("Failed to generate blueprint.");
    }

    return await response.json();
  } catch (error) {
    console.error("An error occurred while generating the blueprint:", error);
    throw error;
  }
};
