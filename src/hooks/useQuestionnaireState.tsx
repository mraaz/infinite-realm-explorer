import { useState, useEffect, useCallback } from "react";
import { Pillar } from "@/components/priority-ranking/types";
import { PillarAnswers } from "@/components/futureQuestionnaire/PillarQuestions";

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
type Answers = { [key in Pillar]?: PillarAnswers };
type QuestionnaireState = {
  priorities: Priorities | null;
  answers: Answers;
};

const LOCAL_STORAGE_KEY = "futureQuestionnaireGuestProgress";

/**
 * Manages the state of the Future Self Questionnaire.
 * @param user - The user object from useAuth(), or null for guests.
 */
export const useQuestionnaireState = (user: User | null) => {
  const [priorities, setPriorities] = useState<Priorities | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [isLoading, setIsLoading] = useState(true);

  // Effect to load initial data from localStorage
  useEffect(() => {
    const loadData = () => {
      // This logic now applies to BOTH guests and logged-in users on initial load.
      // This ensures a seamless transition if a user logs in mid-questionnaire.
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        try {
          const parsedData: QuestionnaireState = JSON.parse(savedData);
          setPriorities(parsedData.priorities || null);
          setAnswers(parsedData.answers || {});
        } catch (error) {
          console.error("Failed to parse progress from localStorage", error);
        }
      }
      setIsLoading(false);
    };

    loadData();
  }, []); // Runs only once on initial mount

  // This effect now ONLY saves progress for GUESTS to localStorage.
  useEffect(() => {
    if (!user && !isLoading) {
      const dataToSave: QuestionnaireState = { priorities, answers };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
    }
  }, [priorities, answers, user, isLoading]);

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
    handlePrioritiesComplete,
    handlePillarAnswersUpdate,
  };
};
