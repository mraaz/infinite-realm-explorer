import { useState, useEffect } from "react";
import { Pillar } from "@/components/priority-ranking/types";
import { PillarAnswers } from "@/components/futureQuestionnaire/PillarQuestions";
import {
  getQuestionnaireState,
  QuestionnaireStatePayload,
} from "@/services/apiService";
import { useAuth } from "@/contexts/AuthContext";

interface User {
  sub: string;
}

type Priorities = {
  mainFocus: Pillar;
  secondaryFocus: Pillar;
  maintenance: Pillar[];
};
type Answers = { [key in Pillar]?: PillarAnswers };

const LOCAL_STORAGE_KEY = "futureQuestionnaireGuestProgress";

export const useQuestionnaireState = () => {
  const { user, authToken } = useAuth();

  const [priorities, setPriorities] = useState<Priorities | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      if (user && authToken) {
        const savedState = await getQuestionnaireState(authToken);

        // --- NEW DEBUGGING LOG ---

        if (savedState) {
          setPriorities(savedState.priorities || null);
          setAnswers(savedState.answers || {});

          if (savedState.step && savedState.step > 0) {
            setStep(savedState.step);
          } else {
            setStep(1);
          }
        }
      } else {
        // Guest logic remains the same...
        const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedData) {
          try {
            const parsedData: QuestionnaireStatePayload = JSON.parse(savedData);
            setPriorities(parsedData.priorities || null);
            setAnswers(parsedData.answers || {});
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
  };
};
