
import { useOnboardingQuestionnaireStore } from '@/store/onboardingQuestionnaireStore';
import { PillarProgress } from '@/components/NewQuadrantChart';

export const useProgressCalculation = () => {
  const { answers, pillarProgress } = useOnboardingQuestionnaireStore();

  const calculateCurrentProgress = (): PillarProgress => {
    const answeredQuestionsCount = Object.keys(answers).length;
    
    console.log("🎯 Progress calculation - using backend progress:", {
      pillarProgress,
      answeredQuestionsCount
    });
    
    // Return empty progress if no questions answered
    if (answeredQuestionsCount === 0) {
      return {
        basics: 0,
        career: 0,
        finances: 0,
        health: 0,
        connections: 0,
      };
    }

    // Trust the backend progress calculation and add basics
    const progress: PillarProgress = { 
      basics: 75, // Always set basics to 75 for now (as it's not a real questionnaire section)
      ...pillarProgress 
    };
    
    console.log("✨ Final progress (backend + basics):", progress);
    return progress;
  };

  const calculateFutureProgress = (isFutureQuestionnaireComplete: boolean): PillarProgress => {
    if (!isFutureQuestionnaireComplete) {
      return {
        basics: 0,
        career: 0,
        finances: 0,
        health: 0,
        connections: 0,
      };
    }

    return {
      basics: 80,
      career: 95,
      finances: 85,
      health: 90,
      connections: 80,
    };
  };

  return {
    calculateCurrentProgress,
    calculateFutureProgress,
  };
};
