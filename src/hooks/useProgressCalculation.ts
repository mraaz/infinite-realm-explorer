
import { useOnboardingQuestionnaireStore } from '@/store/onboardingQuestionnaireStore';
import { PillarProgress } from '@/components/NewQuadrantChart';

export const useProgressCalculation = () => {
  const { answers, pillarProgress, completedSections, currentSection } = useOnboardingQuestionnaireStore();

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

    // Map sections to pillar names for the progress calculation
    const sectionToPillar: Record<string, keyof PillarProgress> = {
      basics: 'basics',
      career: 'career',
      finances: 'finances',
      health: 'health',
      connections: 'connections',
    };

    // Start with the backend progress
    const progress = { ...pillarProgress, basics: 75 }; // Basics still fixed
    
    // Mark completed sections as 100%
    completedSections.forEach(section => {
      const pillarKey = sectionToPillar[section];
      if (pillarKey) {
        progress[pillarKey] = 100;
      }
    });

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
