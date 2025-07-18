import { Pillar } from "@/components/priority-ranking/types";

// --- Type Definitions ---
export interface Priorities {
  mainFocus: Pillar;
  secondaryFocus: Pillar;
  maintenance: Pillar[];
}
type AnswersState = any;
export interface QuestionnaireStatePayload {
  userId?: string;
  priorities: Priorities | null;
  answers: AnswersState;
  step?: number;
}
export interface ProcessAnswerPayload {
  pillarName: Pillar;
  previousQuestion: string;
  userAnswer: string;
}
export interface AIResponse {
  isRelevant: boolean;
  score: number;
  nextQuestion: string | null;
  feedback: string | null;
  suggestions?: string[];
}
export interface Blueprint {
  title: string;
  overallSummary: string;
  mainFocus: { pillar: Pillar; summary: string; actionableSteps: string[] };
  secondaryFocus: {
    pillar: Pillar;
    summary: string;
    actionableSteps: string[];
  };
}

const API_BASE_URL =
  "https://ffwkwcix01.execute-api.us-east-1.amazonaws.com/prod";

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
    if (!response.ok) throw new Error("Failed to fetch questionnaire state.");
    return await response.json();
  } catch (error) {
    console.error("Error fetching questionnaire state:", error);
    return { priorities: null, answers: {}, step: 1 };
  }
};

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
    if (!response.ok) throw new Error("Failed to save progress.");
    console.log("Progress saved successfully.");
  } catch (error) {
    console.error("An error occurred while saving progress:", error);
    throw error;
  }
};

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
    if (!response.ok) throw new Error("Failed to generate blueprint.");
    return await response.json();
  } catch (error) {
    console.error("An error occurred while generating the blueprint:", error);
    throw error;
  }
};
