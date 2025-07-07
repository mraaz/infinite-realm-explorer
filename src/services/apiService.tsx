import { Pillar } from "@/components/priority-ranking/types";

// --- Type Definitions for the data structure ---

// Defines the structure for the user's selected priorities
interface Priorities {
  mainFocus: Pillar;
  secondaryFocus: Pillar;
  maintenance: Pillar[];
}

// Defines the structure for the answers to questions for a single pillar
type PillarAnswers = Record<string, string>;

// Defines the overall structure for all answers, keyed by pillar name
type Answers = { [key in Pillar]?: PillarAnswers };

// This is the shape of the data that will be sent to the backend
export interface QuestionnairePayload {
  priorities: Priorities | null;
  answers: Answers;
}

// The base URL of your deployed API Gateway stage.
const API_BASE_URL =
  "https://ffwkwcix01.execute-api.us-east-1.amazonaws.com/prod";

/**
 * Saves the user's questionnaire progress to the backend.
 * @param {QuestionnairePayload} payload - The current priorities and answers.
 * @param {string} token - The user's JWT token for authentication.
 * @returns {Promise<void>}
 */
export const saveQuestionnaireProgress = async (
  payload: QuestionnairePayload,
  token: string
): Promise<void> => {
  const url = `${API_BASE_URL}/futureQuestionnaire/priorities`;

  console.log("Sending data to backend:", JSON.stringify(payload, null, 2));

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
      console.error("Backend error:", errorData);
      throw new Error(errorData.error || "Failed to save progress.");
    }

    const result = await response.json();
    console.log("Backend response:", result);
  } catch (error) {
    console.error("An error occurred while saving progress:", error);
    throw error;
  }
};
