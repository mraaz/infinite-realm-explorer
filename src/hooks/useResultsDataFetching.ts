import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { FutureQuestionnaire } from "@/types/results"; // Only import what we need

// Define PillarProgress locally for onboarding isolation
interface PillarProgress {
  basics: number;
  career: number;
  finances: number;
  health: number;
  connections: number;
}

// Define the shape of the results data we expect from localStorage or API
interface ResultsData {
  pillarProgress: Partial<PillarProgress>; // Use Partial since 'basics' might be missing
  answers: Record<string, any>;
}

export const useResultsDataFetching = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useAuth(); // Remove token from destructuring

  // State to hold the fetched/retrieved data
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentProgress, setCurrentProgress] = useState<PillarProgress>({
    basics: 0,
    career: 0,
    finances: 0,
    health: 0,
    connections: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      let data: ResultsData | null = null;

      // Get token directly from localStorage
      const token = localStorage.getItem("infinitelife_jwt");

      if (isLoggedIn && token) {
        // LOGGED-IN USER LOGIC
        console.log("Fetching results for logged-in user...");
        try {
          const response = await fetch(
            `https://ffwkwcix01.execute-api.us-east-1.amazonaws.com/prod/questionnaire/state`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (response.ok) {
            const savedState = await response.json();
            data = {
              pillarProgress: savedState.pillarProgress,
              answers: savedState.answers,
            };
          }
        } catch (error) {
          console.error("Error fetching user results:", error);
        }
      } else {
        // GUEST USER LOGIC
        console.log("Fetching results for guest user...");
        const guestDataString = localStorage.getItem("guestResults");
        if (guestDataString) {
          try {
            const parsedData = JSON.parse(guestDataString);
            data = {
              pillarProgress: parsedData.pillarProgress,
              answers: parsedData.answers,
            };
          } catch (error) {
            console.error(
              "Error parsing guest results from localStorage:",
              error
            );
          }
        }
      }

      if (data && data.pillarProgress && data.answers) {
        // --- THIS IS THE NEW, MORE DEFENSIVE FIX ---
        // We will build the progress object key-by-key to ensure
        // every value is a valid number, preventing NaN errors.
        const loadedProgress = data.pillarProgress || {};
        const finalProgress: PillarProgress = {
          basics: Number(loadedProgress.basics) || 0,
          career: Number(loadedProgress.career) || 0,
          finances: Number(loadedProgress.finances) || 0,
          health: Number(loadedProgress.health) || 0,
          connections: Number(loadedProgress.connections) || 0,
        };

        setAnswers(data.answers);
        setCurrentProgress(finalProgress);
      } else {
        console.log("No results data found. Redirecting to questionnaire.");
        navigate("/onboarding-questionnaire");
      }
      setIsLoading(false);
    };

    fetchResults();
  }, [isLoggedIn, navigate]);

  // Keep your existing logic for the "Future Self" questionnaire
  const {
    futureQuestionnaire: locationFutureQuestionnaire,
    futureProgress: locationFutureProgress,
  } = location.state || {};
  const futureQuestionnaire: FutureQuestionnaire | undefined =
    locationFutureQuestionnaire;

  return {
    isLoading,
    answers,
    progress: currentProgress, // This progress object is now guaranteed to be complete and valid
    futureQuestionnaire,
    locationFutureProgress,
  };
};
