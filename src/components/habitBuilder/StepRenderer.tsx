
import React from 'react';
import PillarSelection from './PillarSelection';
import ArchetypeSelection from './ArchetypeSelection';
import HabitBuilding from './HabitBuilding';
import HabitUnlocked from './HabitUnlocked';
import { BuilderStep, HabitData } from '@/hooks/useHabitBuilderState';

interface StepRendererProps {
  currentStep: BuilderStep;
  habitData: Partial<HabitData>;
  isEditing: boolean;
  onNext: (data: Partial<HabitData>) => void;
  onPrevious: () => void;
  onFinish: () => void;
}

const StepRenderer = ({ 
  currentStep, 
  habitData, 
  isEditing, 
  onNext, 
  onPrevious, 
  onFinish 
}: StepRendererProps) => {
  switch (currentStep) {
    case 'pillar':
      return <PillarSelection onNext={onNext} />;
    case 'archetype':
      return (
        <ArchetypeSelection 
          pillar={habitData.pillar!} 
          onNext={onNext}
          onPrevious={onPrevious}
        />
      );
    case 'habit':
      return (
        <HabitBuilding 
          pillar={habitData.pillar!}
          archetype={habitData.archetype!}
          onNext={onNext}
          onPrevious={onPrevious}
          isEditing={isEditing}
          initialData={habitData}
        />
      );
    case 'unlocked':
      return <HabitUnlocked habitData={habitData as HabitData} onFinish={onFinish} />;
    default:
      return null;
  }
};

export default StepRenderer;
