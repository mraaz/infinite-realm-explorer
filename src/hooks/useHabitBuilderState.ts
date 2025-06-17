
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuestionnaireStore } from '@/store/questionnaireStore';

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
  const { futureQuestionnaire, actions } = useQuestionnaireStore();
  
  const editHabitIndex = location.state?.editHabitIndex;
  const isEditing = editHabitIndex !== undefined;

  useEffect(() => {
    console.log('HabitBuilder - Current futureQuestionnaire:', futureQuestionnaire);
    console.log('HabitBuilder - Is editing:', isEditing, 'Edit index:', editHabitIndex);
    
    // If editing, populate existing data
    if (isEditing && futureQuestionnaire?.architect?.[editHabitIndex]) {
      const existingHabit = futureQuestionnaire.architect[editHabitIndex];
      // Parse existing habit data and set initial step
      setHabitData({
        pillar: existingHabit.mainFocus,
        archetype: existingHabit.identity,
        habitStatement: existingHabit.system,
        // Parse action, duration, frequency from existing system
      });
      setCurrentStep('habit');
    }
  }, [isEditing, editHabitIndex, futureQuestionnaire]);

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
    if (isEditing && futureQuestionnaire?.architect) {
      const updatedArchitect = [...futureQuestionnaire.architect];
      updatedArchitect.splice(editHabitIndex, 1);
      
      actions.setFutureQuestionnaire({
        ...futureQuestionnaire,
        architect: updatedArchitect,
      });
      
      navigate('/results');
    }
  };

  const handleFinish = () => {
    console.log('HabitBuilder - Finishing with habitData:', habitData);
    console.log('HabitBuilder - Current futureQuestionnaire before save:', futureQuestionnaire);
    
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

    if (isEditing) {
      // Update existing habit
      const updatedArchitect = [...(futureQuestionnaire?.architect || [])];
      updatedArchitect[editHabitIndex] = newHabit;
      updatedFutureQuestionnaire = {
        ...futureQuestionnaire!,
        architect: updatedArchitect,
      };
    } else {
      // Add new habit
      const updatedArchitect = [...(futureQuestionnaire?.architect || []), newHabit];
      updatedFutureQuestionnaire = {
        ...futureQuestionnaire!,
        architect: updatedArchitect,
      };
    }

    console.log('HabitBuilder - Updated futureQuestionnaire:', updatedFutureQuestionnaire);

    // Update the store
    actions.setFutureQuestionnaire(updatedFutureQuestionnaire);

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
