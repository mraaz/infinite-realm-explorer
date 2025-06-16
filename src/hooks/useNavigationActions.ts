
import { useNavigate, useLocation } from 'react-router-dom';
import { PillarProgress } from '@/components/NewQuadrantChart';

export const useNavigationActions = (progress: PillarProgress) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateToRetake = () => {
    navigate('/questionnaire', { state: { retake: true } });
  };

  const navigateToFutureQuestionnaire = (isArchitect = false, editHabitIndex?: number) => {
    navigate('/future-questionnaire', { 
      state: { 
        ...location.state, 
        progress, 
        isArchitect, 
        editHabitIndex 
      } 
    });
  };

  const navigateToResults = (updatedFutureQuestionnaire: any) => {
    navigate('/results', {
      state: { ...location.state, futureQuestionnaire: updatedFutureQuestionnaire },
      replace: true,
    });
  };

  return {
    navigateToRetake,
    navigateToFutureQuestionnaire,
    navigateToResults,
  };
};
