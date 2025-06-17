
import React from 'react';
import Header from '@/components/Header';
import { QuestionnaireSteps } from '@/components/habitBuilder/QuestionnaireSteps';
import BuilderHeader from '@/components/habitBuilder/BuilderHeader';
import StepRenderer from '@/components/habitBuilder/StepRenderer';
import { useHabitBuilderState } from '@/hooks/useHabitBuilderState';

const HabitBuilder = () => {
  const {
    currentStep,
    habitData,
    isEditing,
    handleNext,
    handlePrevious,
    handleCancel,
    handleDelete,
    handleFinish,
    getStepNumber,
  } = useHabitBuilderState();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 md:py-16">
        <div className="w-full max-w-5xl mx-auto relative">
          <div className="bg-white/60 p-4 sm:p-6 md:p-10 rounded-2xl shadow-lg border border-gray-200/80">
            <BuilderHeader 
              isEditing={isEditing}
              onCancel={handleCancel}
              onDelete={handleDelete}
            />
            
            <div className="mb-6 sm:mb-8">
              <QuestionnaireSteps step={getStepNumber()} />
            </div>
            
            <StepRenderer
              currentStep={currentStep}
              habitData={habitData}
              isEditing={isEditing}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onFinish={handleFinish}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default HabitBuilder;
