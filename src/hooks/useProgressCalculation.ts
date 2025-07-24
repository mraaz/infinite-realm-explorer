
import { useOnboardingQuestionnaireStore } from '@/store/onboardingQuestionnaireStore';
import { PillarProgress } from '@/components/NewQuadrantChart';

export const useProgressCalculation = () => {
  const { answers, pillarProgress, completedSections, currentSection } = useOnboardingQuestionnaireStore();

  const calculateCurrentProgress = (): PillarProgress => {
    const answeredQuestionsCount = Object.keys(answers).length;
    
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

    // Map sections to pillar names for the progress calculation
    const sectionToPillar: Record<string, keyof PillarProgress> = {
      basics: 'basics',
      career: 'career',
      finances: 'finances',
      health: 'health',
      connections: 'connections',
    };

    // Start with the backend progress and ensure basics is included
    const progress: PillarProgress = { 
      basics: 75, // Always set basics to 75 for now (as it's not a real questionnaire section)
      ...pillarProgress 
    };
    
    // Mark completed sections as 100% (this overrides backend progress)
    completedSections.forEach(section => {
      const pillarKey = sectionToPillar[section];
      if (pillarKey && pillarKey !== 'basics') { // Skip basics as it's not a real section
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
