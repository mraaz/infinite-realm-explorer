
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface QuestionnaireNavigationProps {
    step: number;
    isArchitect: boolean;
    onPrevious?: () => void;
    onNext?: () => void;
    onRetake?: () => void;
    onConfirm?: () => void;
    showRetake?: boolean;
    showConfirm?: boolean;
    nextDisabled?: boolean;
}

export const QuestionnaireNavigation: React.FC<QuestionnaireNavigationProps> = ({
    step,
    isArchitect,
    onPrevious,
    onNext,
    onRetake,
    onConfirm,
    showRetake = false,
    showConfirm = false,
    nextDisabled = false,
}) => {
    const maxStep = isArchitect ? 4 : 5;
    const showPrevious = step > 1;
    const isLastStep = step === maxStep;

    return (
        <div className="flex justify-between items-center mt-8">
            {showPrevious ? (
                <Button variant="outline" size="lg" onClick={onPrevious}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                </Button>
            ) : (
                <div className="w-24"></div>
            )}
            
            {isLastStep ? (
                <div className="flex gap-4">
                    {showRetake && (
                        <Button variant="outline" size="lg" onClick={onRetake}>
                            Retake Questionnaire
                        </Button>
                    )}
                    {showConfirm && (
                        <Button 
                            size="lg" 
                            onClick={onConfirm}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
                        >
                            Show Me My Future Self, mate
                        </Button>
                    )}
                </div>
            ) : (
                <Button 
                    size="lg" 
                    onClick={onNext}
                    disabled={nextDisabled}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
                >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            )}
        </div>
    );
};
