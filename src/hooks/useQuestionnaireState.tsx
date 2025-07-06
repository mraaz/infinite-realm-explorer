import { useState, useEffect } from "react";
import { Pillar } from "@/components/priority-ranking/types";
import { PillarAnswers } from "@/components/futureQuestionnaire/PillarQuestions";

// --- Type Definitions ---
// Using the exact User type from your AuthContext
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
 * Manages the state of the Future Self Questionnaire, handling both
 * guest users (localStorage) and logged-in users (backend API).
 * @param user - The user object from useAuth(), or null for guests.
 */
export const useQuestionnaireState = (user: User | null) => {
  const [priorities, setPriorities] = useState<Priorities | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [isLoading, setIsLoading] = useState(true);

  // This effect runs once to load initial data.
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        // --- LOGGED-IN USER ---
        // This is where you will make the API call to your AWS backend.
        // We use `user.sub` as the unique identifier.
        console.log(
          `User ${user.sub} is logged in. Fetching data from backend...`
        );
        try {
          // const response = await fetch(`/api/questionnaire/${user.sub}`);
          // const data = await response.json();
          // if (data) {
          //   setPriorities(data.priorities || null);
          //   setAnswers(data.answers || {});
          // }
        } catch (error) {
          console.error("Failed to fetch questionnaire data for user:", error);
        }
      } else {
        // --- GUEST USER ---
        console.log("User is a guest. Loading data from localStorage...");
        try {
          const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (savedData) {
            const parsedData: QuestionnaireState = JSON.parse(savedData);
            setPriorities(parsedData.priorities || null);
            setAnswers(parsedData.answers || {});
          }
        } catch (error) {
          console.error("Failed to parse guest data from localStorage", error);
        }
      }
      setIsLoading(false);
    };

    loadData();
  }, [user]); // Re-runs only if the user's login status changes.

  // This effect automatically saves progress for GUESTS whenever data changes.
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
