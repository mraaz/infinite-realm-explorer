import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { PillarProgress } from '@/components/NewQuadrantChart';
import PriorityRanking from '@/components/PriorityRanking';
import { Button, buttonVariants } from '@/components/ui/button';
import DeepDive, { DeepDiveAnswers } from '@/components/DeepDive';
import MaintenanceBaseline, { MaintenanceAnswers } from '@/components/MaintenanceBaseline';
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


export type Priorities = {
  mainFocus: string;
  secondaryFocus: string;
  maintenance: string[];
};

const FutureQuestionnaire = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { progress } = (location.state || { progress: null }) as { progress: PillarProgress | null };
    
    const [phase, setPhase] = useState(1);
    const [priorities, setPriorities] = useState<Priorities | null>(null);
    const [deepDiveAnswers, setDeepDiveAnswers] = useState<DeepDiveAnswers | null>(null);
    const [maintenanceAnswers, setMaintenanceAnswers] = useState<MaintenanceAnswers | null>(null);

    const handlePrioritiesComplete = (p: Priorities) => {
        setPriorities(p);
        setPhase(2);
    };

    const handleDeepDiveComplete = (answers: DeepDiveAnswers) => {
        setDeepDiveAnswers(answers);
        setPhase(3);
    };

    const handleMaintenanceComplete = (answers: MaintenanceAnswers) => {
        setMaintenanceAnswers(answers);
        setPhase(4);
    };

    const handleConfirmCancel = () => {
        navigate('/results');
    };

    const handleGoToResults = () => {
      const futureQuestionnaireAnswers = {
          priorities,
          deepDiveAnswers,
          maintenanceAnswers,
      };
      // In a real application, this data would be saved and used on the results page.
      console.log("Future Questionnaire Answers:", futureQuestionnaireAnswers);
      navigate('/results');
    }

    if (!progress) {
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

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-grow flex flex-col items-center px-4 py-8 md:py-12">
                <div className="w-full max-w-4xl">
                    <div className="flex justify-end items-center mb-4 min-h-[40px]">
                        {phase < 4 && (
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
                                Designing Your 5-Year Future
                            </h1>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                Your baseline gives us a great snapshot of today. Now, let's design your future.
                            </p>
                        </div>
                        
                        {phase === 1 && progress && (
                            <PriorityRanking progress={progress} onComplete={handlePrioritiesComplete} />
                        )}
                        {phase === 2 && priorities && (
                            <DeepDive 
                                mainFocus={priorities.mainFocus}
                                secondaryFocus={priorities.secondaryFocus}
                                onComplete={handleDeepDiveComplete}
                            />
                        )}
                        {phase === 3 && priorities && (
                            <MaintenanceBaseline
                                maintenancePillars={priorities.maintenance}
                                onComplete={handleMaintenanceComplete}
                            />
                        )}
                         {phase === 4 && (
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-800">Ready to see your Future Self?</h2>
                                <p className="text-gray-600 mt-2">Excellent. We've mapped out your priorities. Are you ready to see what your 5-year future could look like based on this new focus?</p>
                                 <Button onClick={handleGoToResults} className="mt-6">Show Me My Future Self</Button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FutureQuestionnaire;
