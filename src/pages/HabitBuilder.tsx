
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import PillarSelection from '@/components/habitBuilder/PillarSelection';
import ArchetypeSelection from '@/components/habitBuilder/ArchetypeSelection';
import HabitBuilding from '@/components/habitBuilder/HabitBuilding';
import HabitUnlocked from '@/components/habitBuilder/HabitUnlocked';
import { useQuestionnaireStore } from '@/store/questionnaireStore';

type BuilderStep = 'pillar' | 'archetype' | 'habit' | 'unlocked';

interface HabitData {
  pillar: string;
  archetype: string;
  habitStatement: string;
  action: string;
  duration: string;
  frequency: string;
}

const HabitBuilder = () => {
  const [currentStep, setCurrentStep] = useState<BuilderStep>('pillar');
  const [habitData, setHabitData] = useState<Partial<HabitData>>({});
  const location = useLocation();
  const navigate = useNavigate();
  const { futureQuestionnaire, actions } = useQuestionnaireStore();
  
  const editHabitIndex = location.state?.editHabitIndex;
  const isEditing = editHabitIndex !== undefined;

  useEffect(() => {
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

  const handleFinish = () => {
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

    if (isEditing) {
      // Update existing habit
      const updatedArchitect = [...(futureQuestionnaire?.architect || [])];
      updatedArchitect[editHabitIndex] = newHabit;
      actions.setFutureQuestionnaire({
        ...futureQuestionnaire!,
        architect: updatedArchitect,
      });
    } else {
      // Add new habit
      const updatedArchitect = [...(futureQuestionnaire?.architect || []), newHabit];
      actions.setFutureQuestionnaire({
        ...futureQuestionnaire!,
        architect: updatedArchitect,
      });
    }

    navigate('/results');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'pillar':
        return <PillarSelection onNext={handleNext} />;
      case 'archetype':
        return <ArchetypeSelection pillar={habitData.pillar!} onNext={handleNext} />;
      case 'habit':
        return (
          <HabitBuilding 
            pillar={habitData.pillar!}
            archetype={habitData.archetype!}
            onNext={handleNext}
            isEditing={isEditing}
            initialData={habitData}
          />
        );
      case 'unlocked':
        return <HabitUnlocked habitData={habitData as HabitData} onFinish={handleFinish} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {renderStep()}
      </main>
    </div>
  );
};

export default HabitBuilder;
