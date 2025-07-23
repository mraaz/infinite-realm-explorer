import { useState, useEffect, useCallback } from "react";
import { Pillar } from "@/components/priority-ranking/types";
import { PillarAnswers } from "@/components/futureQuestionnaire/PillarQuestions";
import {
  getQuestionnaireState,
  QuestionnaireStatePayload,
  AnswersState,
} from "@/services/apiService";
import { useAuth } from "@/contexts/AuthContext";

// --- Type Definitions ---
interface User {
  sub: string;
  name?: string;
  email?: string;
  exp: number;
}

type Priorities = {
  mainFocus: Pillar;
  secondaryFocus: Pillar;
  maintenance: Pillar[];
};
type Answers = AnswersState;

const LOCAL_STORAGE_KEY = "futureQuestionnaireGuestProgress";

/**
 * Manages the state of the Future Self Questionnaire.
 * @param user - The user object from useAuth(), or null for guests.
 */
export const useQuestionnaireState = (user: User | null) => {
  const { authToken } = useAuth();
  const [priorities, setPriorities] = useState<Priorities | null>(null);
  const [answers, setAnswers] = useState<Answers>({
    history: [],
    scores: { Career: 0, Financials: 0, Health: 0, Connections: 0 },
    questionCount: { Career: 0, Financials: 0, Health: 0, Connections: 0 }
  });
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Effect to load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      if (user && authToken) {
        const savedState = await getQuestionnaireState(authToken);
        if (savedState) {
          setPriorities(savedState.priorities || null);
          setAnswers(savedState.answers || {
            history: [],
            scores: { Career: 0, Financials: 0, Health: 0, Connections: 0 },
            questionCount: { Career: 0, Financials: 0, Health: 0, Connections: 0 }
          });
          if (savedState.step && savedState.step > 0) {
            setStep(savedState.step);
          }
        }
      } else {
        const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedData) {
          try {
            const parsedData: QuestionnaireStatePayload = JSON.parse(savedData);
            setPriorities(parsedData.priorities || null);
            setAnswers(parsedData.answers || {
              history: [],
              scores: { Career: 0, Financials: 0, Health: 0, Connections: 0 },
              questionCount: { Career: 0, Financials: 0, Health: 0, Connections: 0 }
            });
            setStep(parsedData.step || 1);
          } catch (error) {
            console.error("Failed to parse progress from localStorage", error);
          }
        }
      }
      setIsLoading(false);
    };
    loadData();
  }, [user, authToken]);

  // Effect to save progress for GUESTS
  useEffect(() => {
    if (!user && !isLoading) {
      const dataToSave: QuestionnaireStatePayload = {
        priorities,
        answers,
        step,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
    }
  }, [priorities, answers, step, user, isLoading]);

  const handlePrioritiesComplete = (newPriorities: Priorities | null) => {
    setPriorities(newPriorities);
  };

  const handlePillarAnswersUpdate = (
    pillarName: Pillar,
    pillarAnswers: PillarAnswers
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [pillarName]: pillarAnswers,
    }));
  };

  return {
    isLoading,
    priorities,
    answers,
    step,
    setStep,
    handlePrioritiesComplete,
    handlePillarAnswersUpdate,
    // --- MODIFICATION: Expose the setAnswers function ---
    setAnswers,
  };
};
