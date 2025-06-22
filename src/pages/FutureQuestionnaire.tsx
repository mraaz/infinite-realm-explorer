import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { PillarProgress } from '@/components/NewQuadrantChart';
import { Button, buttonVariants } from '@/components/ui/button';
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
} from "@/components/ui/alert-dialog";
import { Pillar } from '@/components/priority-ranking/types';
import { QuestionnaireSteps } from '@/components/futureQuestionnaire/QuestionnaireSteps';
import { QuestionnaireNavigation } from '@/components/futureQuestionnaire/QuestionnaireNavigation';
import { ArchitectFlow } from '@/components/futureQuestionnaire/ArchitectFlow';
import { StandardFlow } from '@/components/futureQuestionnaire/StandardFlow';
import { ConfirmationStep } from '@/components/futureQuestionnaire/ConfirmationStep';

type Priorities = { mainFocus: Pillar; secondaryFocus: Pillar; maintenance: Pillar[] };
type Answers = Record<string, string>;
type ArchitectAnswers = { identity: string; system: string; proof: string; };

const FutureQuestionnaire = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { progress, isArchitect, editHabitIndex } = (location.state || { progress: null, isArchitect: false, editHabitIndex: undefined }) as { progress: PillarProgress | null, isArchitect: boolean, editHabitIndex?: number };
    
    const [step, setStep] = useState(1);
    const [priorities, setPriorities] = useState<Priorities | null>(null);
    const [answers, setAnswers] = useState<Answers>({});
    const [architectAnswers, setArchitectAnswers] = useState<ArchitectAnswers>({ identity: '', system: '', proof: '' });

    useEffect(() => {
        // Pre-fill architect answers when editing an existing habit
        if (isArchitect && location.state?.futureQuestionnaire?.architect && typeof editHabitIndex === 'number') {
            const architectData = location.state.futureQuestionnaire.architect;
            const habits = Array.isArray(architectData) ? architectData : [architectData];
            if (habits[editHabitIndex]) {
                setArchitectAnswers(habits[editHabitIndex]);
            }
        }
    }, [isArchitect, location.state, editHabitIndex]);

    useEffect(() => {
        if (isArchitect && progress && !priorities) {
            // Automatically determine priorities for Architect flow
            const pillarScores = (Object.keys(progress) as (keyof PillarProgress)[])
                .filter(p => p !== 'basics')
                .map(pillar => {
                    let name = pillar.charAt(0).toUpperCase() + pillar.slice(1);
                    if (pillar === 'finances') {
                        name = 'Financials';
                    }
                    return ({ name: name as Pillar, score: progress[pillar] });
                })
                .sort((a, b) => a.score - b.score);

            const chosenPriorities: Priorities = {
                mainFocus: pillarScores[0].name,
                secondaryFocus: pillarScores[1].name,
                maintenance: [pillarScores[2].name, pillarScores[3].name],
            };
            setPriorities(chosenPriorities);
        }
    }, [isArchitect, progress, priorities]);

    // RENAMED and SIMPLIFIED - only updates the data, doesn't navigate
    const handlePrioritiesChange = (chosenPriorities: Priorities | null) => {
        setPriorities(chosenPriorities);
    };

    const handleDeepDiveComplete = (deepDiveAnswers: Answers) => {
        setAnswers(deepDiveAnswers);
    };

    const handleMaintenanceComplete = (maintenanceAnswers: Answers) => {
        setAnswers(maintenanceAnswers);
    };

    // Architect flow handlers
    const handleIdentityComplete = (identity: string) => {
        setArchitectAnswers(prev => ({ ...prev, identity }));
        setStep(2);
    };

    const handleSystemComplete = (system: string) => {
        setArchitectAnswers(prev => ({ ...prev, system }));
        setStep(3);
    };

    const handleProofComplete = (proof: string) => {
        setArchitectAnswers(prev => ({ ...prev, proof }));
        setStep(4);
    };

    const handlePrevious = () => {
        setStep(prev => Math.max(prev - 1, 1));
    };

    // SIMPLIFIED - only handles navigation to next step
    const handleNext = () => {
        setStep(prev => prev + 1);
    };

    const handleRetake = () => {
        setStep(1);
    };

    const handleConfirm = () => {
        const existingFq = location.state?.futureQuestionnaire;
        const existingArchitectData = existingFq?.architect;
        let allHabits = existingArchitectData ? (Array.isArray(existingArchitectData) ? [...existingArchitectData] : [existingArchitectData]) : [];
        
        if (typeof editHabitIndex === 'number' && editHabitIndex < allHabits.length) {
            allHabits[editHabitIndex] = architectAnswers;
        } else {
            allHabits.push(architectAnswers);
        }

        const futureQuestionnaireAnswers = isArchitect
            ? {
                ...(existingFq || {}),
                priorities: priorities,
                architect: allHabits.filter(h => h.identity || h.system || h.proof),
              }
            : {
                ...(existingFq || {}),
                priorities: priorities,
                answers: answers,
                architect: undefined,
              };

        console.log("Future Questionnaire Answers:", futureQuestionnaireAnswers);
        // Pass the completed data back to the results page, preserving existing state
        navigate('/results', { state: { ...location.state, futureQuestionnaire: futureQuestionnaireAnswers } });
    };

    const handleConfirmCancel = () => {
        navigate('/results', { state: location.state });
    };

    const isNextDisabled = () => {
        if (isArchitect) {
            if (step === 1) return !architectAnswers.identity;
            if (step === 2) return !architectAnswers.system;
            if (step === 3) return !architectAnswers.proof;
        } else {
            if (step === 1) return !priorities;
            if (step === 2 || step === 3 || step === 4) return !answers || Object.keys(answers).length === 0;
        }
        return false;
    };

    if (!progress) {
        return (
            <div className="min-h-screen flex flex-col bg-[#16161a]">
                <Header />
                <main className="flex-grow flex flex-col items-center justify-center px-4 text-center">
                    <h1 className="text-2xl font-bold text-white">Error</h1>
                    <p className="text-gray-400 mt-2">Progress data not found. Please go back to the results page and try again.</p>
                    <Button onClick={() => navigate('/results')} className="mt-4">Back to Results</Button>
                </main>
            </div>
        );
    }

    const renderCurrentStep = () => {
        if (isArchitect) {
            if (!priorities) {
                return <div className="text-center py-12 text-gray-400">Calculating focus areas...</div>;
            }
            
            if (step === 4) {
                return (
                    <ConfirmationStep
                        isArchitect={true}
                        priorities={priorities}
                        answers={answers}
                        architectAnswers={architectAnswers}
                        onPrevious={handlePrevious}
                        onRetake={handleRetake}
                        onConfirm={handleConfirm}
                    />
                );
            }
            
            return (
                <ArchitectFlow
                    step={step}
                    priorities={priorities}
                    architectAnswers={architectAnswers}
                    onIdentityComplete={handleIdentityComplete}
                    onSystemComplete={handleSystemComplete}
                    onProofComplete={handleProofComplete}
                    onPrevious={handlePrevious}
                />
            );
        }

        if (step === 5) {
            return (
                <ConfirmationStep
                    isArchitect={false}
                    priorities={priorities}
                    answers={answers}
                    architectAnswers={architectAnswers}
                    onPrevious={handlePrevious}
                    onRetake={handleRetake}
                    onConfirm={handleConfirm}
                />
            );
        }

        return (
            <StandardFlow
                step={step}
                progress={progress}
                priorities={priorities}
                answers={answers}
                onPrioritiesChange={handlePrioritiesChange}
                onDeepDiveComplete={handleDeepDiveComplete}
                onMaintenanceComplete={handleMaintenanceComplete}
                onPrevious={handlePrevious}
            />
        );
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#16161a]">
            <Header />
            <main className="flex-grow flex flex-col items-center px-4 py-8 md:py-12">
                <div className="w-full max-w-5xl">
                    <div className="flex justify-end items-center mb-4 min-h-[40px]">
                        {step < (isArchitect ? 4 : 5) && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" className="text-gray-400 hover:text-white">Cancel and Return to Results</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-[#1e1e24] border-gray-700">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-white">Are you sure you want to cancel?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-gray-400">
                                            Your progress for the Future Self Architect will be lost. You can always start again from the results page.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="text-gray-400 border-gray-600 hover:text-white hover:border-gray-500">Continue Designing</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleConfirmCancel} className={buttonVariants({ variant: "destructive" })}>Yes, Cancel</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                    <div className="bg-[#1e1e24] p-6 md:p-10 rounded-2xl shadow-lg border border-gray-700">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                                {isArchitect ? 'Future Self Architect' : 'Future Self Questionnaire'}
                            </h1>
                            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
                                {isArchitect
                                    ? "Let's design the identity, systems, and proof for your future self."
                                    : 'This questionnaire is designed to help you define your vision for the next five years.'}
                            </p>
                        </div>

                        <QuestionnaireSteps step={step} isArchitect={isArchitect} />
                        
                        {renderCurrentStep()}

                        {step < (isArchitect ? 4 : 5) && (
                            <QuestionnaireNavigation
                                step={step}
                                isArchitect={isArchitect}
                                onPrevious={step > 1 ? handlePrevious : undefined}
                                onNext={handleNext}
                                nextDisabled={isNextDisabled()}
                            />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FutureQuestionnaire;
