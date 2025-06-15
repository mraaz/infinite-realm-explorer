
import { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { PillarProgress } from '@/components/NewQuadrantChart';
import { Button, buttonVariants } from '@/components/ui/button';
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

const FutureQuestionnaire = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { progress } = (location.state || { progress: null }) as { progress: PillarProgress | null };
    
    const [step, setStep] = useState(1);
    const [identity, setIdentity] = useState<string | null>(null);
    const [system, setSystem] = useState<string | null>(null);

    const mainFocus = useMemo(() => {
        if (!progress) return null;
        const pillarScores = Object.entries(progress) as [string, number][];
        if (pillarScores.length === 0) return null;
        
        // Find the pillar with the lowest score to be the main focus
        pillarScores.sort((a, b) => a[1] - b[1]);
        return pillarScores[0][0];
    }, [progress]);

    const handleIdentityComplete = (chosenIdentity: string) => {
        setIdentity(chosenIdentity);
        setStep(2);
    };

    const handleSystemComplete = (chosenSystem: string) => {
        setSystem(chosenSystem);
        setStep(3);
    };

    const handleProofComplete = (chosenProof: string) => {
        const futureArchitectAnswers = {
            mainFocus,
            identity,
            system,
            proof: chosenProof,
        };
        console.log("Future Architect Answers:", futureArchitectAnswers);
        // Pass the completed data back to the results page
        navigate('/results', { state: { architect: futureArchitectAnswers, progress } });
    };

    const handleConfirmCancel = () => {
        navigate('/results');
    };

    if (!progress || !mainFocus) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
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
        switch (step) {
            case 1:
                return <IdentityArchetypeSelection mainFocus={mainFocus} onComplete={handleIdentityComplete} />;
            case 2:
                return <CoreSystemDesign mainFocus={mainFocus} chosenIdentity={identity!} onComplete={handleSystemComplete} />;
            case 3:
                return <ProofOfIdentity chosenIdentity={identity!} onComplete={handleProofComplete} />;
            default:
                return null;
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-grow flex flex-col items-center px-4 py-8 md:py-12">
                <div className="w-full max-w-4xl">
                    <div className="flex justify-end items-center mb-4 min-h-[40px]">
                        {step < 4 && (
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
                    <div className="bg-white p-6 md:p-10 rounded-xl shadow-lg border border-gray-200/80">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
                                Future Self Architect
                            </h1>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                Goals are fleeting, but your identity is who you are. Let's define your future self and build the systems to make success inevitable.
                            </p>
                        </div>
                        
                        <CurrentStepComponent />

                    </div>
                </div>
            </main>
        </div>
    );
};

export default FutureQuestionnaire;
