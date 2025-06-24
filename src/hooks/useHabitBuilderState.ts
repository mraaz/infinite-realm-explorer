
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useOnboardingQuestionnaireStore } from '@/store/onboardingQuestionnaireStore';

export type BuilderStep = 'pillar' | 'archetype' | 'habit' | 'unlocked';

export interface HabitData {
  pillar: string;
  archetype: string;
  habitStatement: string;
  action: string;
  duration: string;
  frequency: string;
}

export const useHabitBuilderState = () => {
  const [currentStep, setCurrentStep] = useState<BuilderStep>('pillar');
  const [habitData, setHabitData] = useState<Partial<HabitData>>({});
  const location = useLocation();
  const navigate = useNavigate();
  
  const editHabitIndex = location.state?.editHabitIndex;
  const isEditing = editHabitIndex !== undefined;

  useEffect(() => {
    console.log('HabitBuilder - Is editing:', isEditing, 'Edit index:', editHabitIndex);
    
    // If editing, populate existing data
    if (isEditing && location.state?.futureQuestionnaire?.architect?.[editHabitIndex]) {
      const existingHabit = location.state.futureQuestionnaire.architect[editHabitIndex];
      // Parse existing habit data and set initial step
      setHabitData({
        pillar: existingHabit.mainFocus,
        archetype: existingHabit.identity,
        habitStatement: existingHabit.system,
        // Parse action, duration, frequency from existing system
      });
      setCurrentStep('habit');
    }
  }, [isEditing, editHabitIndex, location.state]);

  const handleNext = (data: Partial<HabitData>) => {
    setHabitData(prev => ({ ...prev, ...data }));
    
    switch (currentStep) {
      case 'pillar':
        setCurrentStep('archetype');
        break;
      case 'archetype':
        setCurrentStep('habit');
        break;
      case 'habit':
        setCurrentStep('unlocked');
        break;
    }
  };

  const handlePrevious = () => {
    switch (currentStep) {
      case 'archetype':
        setCurrentStep('pillar');
        break;
      case 'habit':
        setCurrentStep('archetype');
        break;
      case 'unlocked':
        setCurrentStep('habit');
        break;
    }
  };

  const handleCancel = () => {
    navigate('/results');
  };

  const handleDelete = () => {
    if (isEditing && location.state?.futureQuestionnaire?.architect) {
      const updatedArchitect = [...location.state.futureQuestionnaire.architect];
      updatedArchitect.splice(editHabitIndex, 1);
      
      navigate('/results', {
        state: {
          ...location.state,
          futureQuestionnaire: {
            ...location.state.futureQuestionnaire,
            architect: updatedArchitect,
          }
        }
      });
    }
  };

  const handleFinish = () => {
    console.log('HabitBuilder - Finishing with habitData:', habitData);
    
    // Save habit to store
    const newHabit = {
      identity: habitData.archetype!,
      system: habitData.habitStatement!,
      proof: `I am someone who ${habitData.action}`,
      mainFocus: habitData.pillar!,
      isCompleted: false,
      streakWeeks: [],
      currentStreak: 0,
    };

    console.log('HabitBuilder - New habit being created:', newHabit);

    let updatedFutureQuestionnaire;
    const currentFutureQuestionnaire = location.state?.futureQuestionnaire;

    if (isEditing) {
      // Update existing habit
      const updatedArchitect = [...(currentFutureQuestionnaire?.architect || [])];
      updatedArchitect[editHabitIndex] = newHabit;
      updatedFutureQuestionnaire = {
        ...currentFutureQuestionnaire!,
        architect: updatedArchitect,
      };
    } else {
      // Add new habit
      const updatedArchitect = [...(currentFutureQuestionnaire?.architect || []), newHabit];
      updatedFutureQuestionnaire = {
        ...currentFutureQuestionnaire!,
        architect: updatedArchitect,
      };
    }

    console.log('HabitBuilder - Updated futureQuestionnaire:', updatedFutureQuestionnaire);

    // Navigate back to results with the updated data
    navigate('/results', {
      state: {
        futureQuestionnaire: updatedFutureQuestionnaire,
        ...location.state
      },
      replace: true
    });
  };

  const getStepNumber = () => {
    switch (currentStep) {
      case 'pillar': return 1;
      case 'archetype': return 2;
      case 'habit': return 3;
      case 'unlocked': return 4;
      default: return 1;
    }
  };

  return {
    currentStep,
    habitData,
    isEditing,
    editHabitIndex,
    handleNext,
    handlePrevious,
    handleCancel,
    handleDelete,
    handleFinish,
    getStepNumber,
  };
};
