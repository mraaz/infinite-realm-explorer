
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import PillarSelection from '@/components/habitBuilder/PillarSelection';
import ArchetypeSelection from '@/components/habitBuilder/ArchetypeSelection';
import HabitBuilding from '@/components/habitBuilder/HabitBuilding';
import HabitUnlocked from '@/components/habitBuilder/HabitUnlocked';
import { QuestionnaireSteps } from '@/components/habitBuilder/QuestionnaireSteps';
import { useQuestionnaireStore } from '@/store/questionnaireStore';
import { Button } from '@/components/ui/button';
import { Trash2, X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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
          {/* Cancel button outside the card for non-editing mode */}
          {!isEditing && (
            <div className="flex justify-end mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}
          
          <div className="bg-white/60 p-6 md:p-10 rounded-2xl shadow-lg border border-gray-200/80">
            <div className="flex justify-between items-start mb-8">
              <div className="text-center flex-1">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
                  The Habit Architect
                </h1>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Design a custom habit system tailored to your goals and lifestyle.
                </p>
              </div>
              
              {isEditing && (
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Habit</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this habit? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
            
            <QuestionnaireSteps step={getStepNumber()} />
            
            {renderStep()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HabitBuilder;
