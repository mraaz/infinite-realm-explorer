import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QuestionnaireHeader from "@/components/QuestionnaireHeader";
import PillarStatus from "@/components/PillarStatus";
import QuestionBox from "@/components/QuestionBox";
import OverallProgressBar from "@/components/OverallProgressBar";
import Header from "@/components/Header";
import { useQuestionnaireStore } from "@/store/questionnaireStore";
import { useAuth } from '@/contexts/AuthContext';
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

const Questionnaire = () => {
  const { actions, answers, currentQuestionIndex, questionFlow } = useQuestionnaireStore();
  const { getCurrentQuestion, getProgress } = actions;
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isRetake = location.state?.retake === true;
  
  // Check if user came from guest flow via URL parameter
  const urlParams = new URLSearchParams(location.search);
  const isGuestMode = urlParams.get('guest') === 'true';
  
  const currentQuestion = getCurrentQuestion();
  const { overallPercentage, pillarPercentages } = getProgress();

  // Redirect unauthenticated users to home (except retakes and guest mode)
  useEffect(() => {
    if (!isLoggedIn && !isRetake && !isGuestMode) {
      navigate('/');
    }
  }, [isLoggedIn, isRetake, isGuestMode, navigate]);

  useEffect(() => {
    if (questionFlow.length > 0 && currentQuestionIndex >= questionFlow.length) {
      console.log("Submitting questionnaire answers to backend:", JSON.stringify(answers, null, 2));
      navigate('/results');
    }
  }, [currentQuestionIndex, questionFlow.length, navigate, answers]);

  const handleConfirmCancel = () => {
    navigate('/results');
  };

  // Check if user has access to the questionnaire
  const hasQuestionnaireAccess = isLoggedIn || isRetake || isGuestMode;

  // If user doesn't have access, return null (they'll be redirected)
  if (!hasQuestionnaireAccess) {
    return null;
  }

  if (!currentQuestion) {
    // Handle completion state
    return (
      <div className="min-h-screen flex flex-col bg-[#16161a]">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center px-4 py-8 md:py-12">
          <div className="w-full max-w-5xl text-center">
            <h1 className="text-3xl font-bold text-white my-8">
              Calculating your results...
            </h1>
            <p className="text-lg text-gray-400">Please wait a moment.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#16161a]">
      <Header />
      <main className="flex-grow flex flex-col items-center px-4 py-8 md:py-12">
        <div className="w-full max-w-5xl">
          <div className="flex justify-between items-center mb-8">
            <QuestionnaireHeader currentQuestion={currentQuestionIndex + 1} totalQuestions={questionFlow.length} />
            {isRetake && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" className="text-gray-400 hover:text-white">Cancel and Return to Results</Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-[#1e1e24] border-gray-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Are you sure you want to cancel?</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-400">
                      Your progress on this retake will be lost. You can always start again from the results page.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="text-gray-400 border-gray-600 hover:text-white hover:border-gray-500">Continue Retake</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmCancel} className={buttonVariants({ variant: "destructive" })}>Yes, Cancel</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          <h1 className="text-3xl font-bold text-white text-center">
            Building Your 5-Year Snapshot
          </h1>
          <PillarStatus pillarPercentages={pillarPercentages} />
          <QuestionBox 
            key={currentQuestion.id}
            question={currentQuestion}
            value={answers[currentQuestion.id]}
          />
          <OverallProgressBar value={overallPercentage} />
        </div>
      </main>
    </div>
  );
};

export default Questionnaire;
