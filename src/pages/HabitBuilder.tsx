import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import PillarSelection from '@/components/habitBuilder/PillarSelection';
import ArchetypeSelection from '@/components/habitBuilder/ArchetypeSelection';
import HabitBuilding from '@/components/habitBuilder/HabitBuilding';
import HabitUnlocked from '@/components/habitBuilder/HabitUnlocked';
import { QuestionnaireSteps } from '@/components/habitBuilder/QuestionnaireSteps';
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

  const getStepNumber = () => {
    switch (currentStep) {
      case 'pillar': return 1;
      case 'archetype': return 2;
      case 'habit': return 3;
      case 'unlocked': return 4;
      default: return 1;
    }
  };

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
        return (
          <ArchetypeSelection 
            pillar={habitData.pillar!} 
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 'habit':
        return (
          <HabitBuilding 
            pillar={habitData.pillar!}
            archetype={habitData.archetype!}
            onNext={handleNext}
            onPrevious={handlePrevious}
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
        <div className="w-full max-w-5xl mx-auto">
          <div className="bg-white/60 p-6 md:p-10 rounded-2xl shadow-lg border border-gray-200/80">
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
                The Habit Architect
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Design a custom habit system tailored to your goals and lifestyle.
              </p>
            </div>
            
            {renderStep()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HabitBuilder;
