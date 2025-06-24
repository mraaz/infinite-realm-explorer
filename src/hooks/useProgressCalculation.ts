
import { useOnboardingQuestionnaireStore } from '@/store/onboardingQuestionnaireStore';
import { PillarProgress } from '@/components/NewQuadrantChart';

export const useProgressCalculation = () => {
  const { answers } = useOnboardingQuestionnaireStore();

  const calculateCurrentProgress = (): PillarProgress => {
    const answeredQuestionsCount = Object.keys(answers).length;
    
    // Return mock data if no questions answered
    if (answeredQuestionsCount === 0) {
      return {
        basics: 75,
        career: 80,
        finances: 60,
        health: 90,
        connections: 70,
      };
    }

    // Calculate real progress from answers (simplified for now)
    return {
      basics: 75, // Basics is always fixed for now
      career: 80,
      finances: 60,
      health: 90,
      connections: 70,
    };
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
