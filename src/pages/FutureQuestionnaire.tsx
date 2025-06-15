import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { PillarProgress } from '@/components/NewQuadrantChart';
import { Button, buttonVariants } from '@/components/ui/button';
import { PriorityRanking } from '@/components/PriorityRanking';
import { DeepDive } from '@/components/DeepDive';
import { MaintenanceBaseline } from '@/components/MaintenanceBaseline';
import IdentityArchetypeSelection from '@/components/IdentityArchetypeSelection';
import CoreSystemDesign from '@/components/CoreSystemDesign';
import ProofOfIdentity from '@/components/ProofOfIdentity';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from 'lucide-react';
import { futureQuestions } from '@/data/futureQuestions';
import { Pillar } from '@/components/priority-ranking/types';

type Priorities = { mainFocus: Pillar; secondaryFocus: Pillar; maintenance: Pillar[] };
type Answers = Record<string, string>;
type ArchitectAnswers = { identity: string; system: string; proof: string; };

const STEPS = [
    { id: 1, name: 'Setting Priorities' },
    { id: 2, name: 'Main Focus' },
    { id: 3, name: 'Secondary Focus' },
    { id: 4, name: 'Maintenance' },
    { id: 5, name: 'Confirmation' },
];

const ARCHITECT_STEPS = [
    { id: 1, name: 'Choose Identity' },
    { id: 2, name: 'Design System' },
    { id: 3, name: 'Define Proof' },
    { id: 4, name: 'Confirmation' },
];

const FutureQuestionnaire = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { progress, isArchitect } = (location.state || { progress: null, isArchitect: false }) as { progress: PillarProgress | null, isArchitect: boolean };
    
    const [step, setStep] = useState(1);
    const [priorities, setPriorities] = useState<Priorities | null>(null);
    const [answers, setAnswers] = useState<Answers>({});
    const [architectAnswers, setArchitectAnswers] = useState<ArchitectAnswers>({ identity: '', system: '', proof: '' });

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

    const handlePrioritiesComplete = (chosenPriorities: Priorities) => {
        setPriorities(chosenPriorities);
        setStep(2);
    };

    const handleDeepDiveComplete = (deepDiveAnswers: Answers) => {
        setAnswers(deepDiveAnswers);
        setStep(prev => prev + 1);
    };

    const handleMaintenanceComplete = (maintenanceAnswers: Answers) => {
        setAnswers(maintenanceAnswers);
        setStep(5);
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

    const handleRetake = () => {
        setStep(1);
    };

    const handleConfirm = () => {
        const futureQuestionnaireAnswers = {
            priorities,
            answers: isArchitect ? {} : answers,
            architect: isArchitect ? architectAnswers : undefined,
        };
        console.log("Future Questionnaire Answers:", futureQuestionnaireAnswers);
        // Pass the completed data back to the results page, preserving existing state
        navigate('/results', { state: { ...location.state, futureQuestionnaire: futureQuestionnaireAnswers } });
    };

    const handleConfirmCancel = () => {
        navigate('/results', { state: location.state });
    };

    if (!progress) {
        return (
            <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
                <Header />
                <main className="flex-grow flex flex-col items-center justify-center px-4 text-center">
                    <h1 className="text-2xl font-bold text-gray-800">Error</h1>
                    <p className="text-gray-600 mt-2">Progress data not found. Please go back to the results page and try again.</p>
                    <Button onClick={() => navigate('/results')} className="mt-4">Back to Results</Button>
                </main>
            </div>
        );
    }

    const CurrentStepComponent = () => {
        if (isArchitect) {
            if (!priorities) {
                return <div className="text-center py-12">Calculating focus areas...</div>;
            }
            switch (step) {
                case 1:
                    return <IdentityArchetypeSelection mainFocus={priorities.mainFocus.toLowerCase()} onComplete={handleIdentityComplete} value={architectAnswers.identity} />;
                case 2:
                    return <CoreSystemDesign mainFocus={priorities.mainFocus.toLowerCase()} chosenIdentity={architectAnswers.identity} onComplete={handleSystemComplete} value={architectAnswers.system} />;
                case 3:
                    return <ProofOfIdentity chosenIdentity={architectAnswers.identity} onComplete={handleProofComplete} value={architectAnswers.proof} />;
                case 4:
                    return (
                        <div>
                            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Confirm Your Future Identity</h2>
                            
                            <div className="space-y-6">
                                <Card className="bg-white/80 border-gray-200/80">
                                    <CardHeader>
                                        <CardTitle className="text-lg text-gray-700">Your Chosen Identity</CardTitle>
                                        <CardDescription>Step 1: The person you will become.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-700 italic">"{architectAnswers.identity || 'Not set'}"</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white/80 border-gray-200/80">
                                    <CardHeader>
                                        <CardTitle className="text-lg text-gray-700">Your Core System</CardTitle>
                                        <CardDescription>Step 2: The habits that will forge your identity.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-700 italic">"{architectAnswers.system || 'Not set'}"</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white/80 border-gray-200/80">
                                    <CardHeader>
                                        <CardTitle className="text-lg text-gray-700">Your Proof of Identity</CardTitle>
                                        <CardDescription>Step 3: Your first step on this new path.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-700 italic">"{architectAnswers.proof || 'Not set'}"</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                                <Button variant="outline" size="lg" onClick={handleRetake}>Retake Questionnaire</Button>
                                <Button size="lg" onClick={handleConfirm}>Show Me My Future Self, mate</Button>
                            </div>
                        </div>
                    );
                default:
                    return null;
            }
        }

        // Non-architect flow
        switch (step) {
            case 1:
                return <PriorityRanking progress={progress} onComplete={handlePrioritiesComplete} value={priorities} />;
            case 2:
                if (!priorities) return null;
                return <DeepDive pillar={priorities.mainFocus as any} onComplete={handleDeepDiveComplete} value={answers} />;
            case 3:
                if (!priorities) return null;
                return <DeepDive pillar={priorities.secondaryFocus as any} onComplete={handleDeepDiveComplete} value={answers} />;
            case 4:
                if (!priorities) return null;
                return <MaintenanceBaseline maintenancePillars={priorities.maintenance as any} onComplete={handleMaintenanceComplete} value={answers} />;
            case 5:
                return (
                     <div>
                        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Confirm Your Future Self</h2>
                        
                        {priorities && (
                            <div className="bg-white/80 p-6 rounded-xl shadow-md border border-gray-200/80 mb-6 text-left">
                                <h3 className="text-xl font-semibold text-gray-700 mb-4">Your Priorities</h3>
                                <p className="mb-2"><strong>Main Focus:</strong> {priorities.mainFocus}</p>
                                <p className="mb-2"><strong>Secondary Focus:</strong> {priorities.secondaryFocus}</p>
                                <p><strong>Maintenance Pillars:</strong> {priorities.maintenance.join(', ')}</p>
                            </div>
                        )}

                        {Object.keys(answers).length > 0 && (
                            <div className="bg-white/80 p-6 rounded-xl shadow-md border border-gray-200/80 mb-6 text-left">
                                <h3 className="text-xl font-semibold text-gray-700 mb-4">Your Plan</h3>
                                {Object.entries(answers)
                                .sort(([keyA], [keyB]) => futureQuestions.findIndex(q => q.id === keyA) - futureQuestions.findIndex(q => q.id === keyB))
                                .map(([key, value]) => {
                                  const question = futureQuestions.find(q => q.id === key);
                                  if (!question) return null;
                                  return (
                                    <div key={key} className="mb-4 border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                                        <p className="font-semibold text-gray-700">{question.question}</p>
                                        <p className="text-gray-600 pl-4 mt-1">{value}</p>
                                    </div>
                                  );
                                })}
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                            <Button variant="outline" size="lg" onClick={handleRetake}>Retake Questionnaire</Button>
                            <Button size="lg" onClick={handleConfirm}>Show Me My Future Self, mate</Button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    }

    const Stepper = () => {
        const stepsToRender = isArchitect ? ARCHITECT_STEPS : STEPS;
        return (
            <nav aria-label="Progress" className="mb-12">
                <ol role="list" className="flex items-center justify-between">
                    {stepsToRender.map((s, stepIdx) => (
                        <React.Fragment key={s.id}>
                            <li className="flex flex-col items-center text-center w-24">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= s.id ? 'bg-purple-600' : 'bg-gray-300'}`}>
                                    <span className="text-white font-bold">{step > s.id ? <CheckCircle size={20} /> : s.id}</span>
                                </div>
                                <span className={`mt-2 block font-medium text-sm ${step >= s.id ? 'text-purple-700' : 'text-gray-500'}`}>{s.name}</span>
                            </li>
                            {stepIdx < stepsToRender.length - 1 && (
                                <div className={`flex-auto border-t-2 ${step > s.id ? 'border-purple-600' : 'border-gray-300'}`} />
                            )}
                        </React.Fragment>
                    ))}
                </ol>
            </nav>
        )
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
            <Header />
            <main className="flex-grow flex flex-col items-center px-4 py-8 md:py-12">
                <div className="w-full max-w-5xl">
                    <div className="flex justify-end items-center mb-4 min-h-[40px]">
                        {step < 5 && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost">Cancel and Return to Results</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Your progress for the Future Self Architect will be lost. You can always start again from the results page.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Continue Designing</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleConfirmCancel} className={buttonVariants({ variant: "destructive" })}>Yes, Cancel</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                    <div className="bg-white/60 p-6 md:p-10 rounded-2xl shadow-lg border border-gray-200/80">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
                                {isArchitect ? 'Future Self Architect' : 'Future Self Questionnaire'}
                            </h1>
                            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                                {isArchitect
                                    ? "Let's design the identity, systems, and proof for your future self."
                                    : 'This questionnaire is designed to help you define your vision for the next five years.'}
                            </p>
                        </div>

                        <Stepper />
                        
                        <CurrentStepComponent />

                    </div>
                </div>
            </main>
        </div>
    );
};

export default FutureQuestionnaire;
