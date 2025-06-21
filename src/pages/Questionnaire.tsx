
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QuestionnaireHeader from "@/components/QuestionnaireHeader";
import PillarStatus from "@/components/PillarStatus";
import QuestionBox from "@/components/QuestionBox";
import OverallProgressBar from "@/components/OverallProgressBar";
import Header from "@/components/Header";
import { SaveProgressModal } from "@/components/SaveProgressModal";
import { SurveyCompletionDialog } from "@/components/SurveyCompletionDialog";
import { useQuestionnaireStore } from "@/store/questionnaireStore";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { useSurveySession } from "@/hooks/useSurveySession";
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
  const { getCurrentQuestion, getProgress, loadSavedAnswers, setSurveySessionId } = actions;
  const { user } = useSecureAuth();
  const { surveySession, isLoading, isResuming, saveAnswer, completeSurvey, makePublic, isAuthenticated } = useSurveySession();
  const navigate = useNavigate();
  const location = useLocation();
  const isRetake = location.state?.retake === true;
  
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [hasShownSaveModal, setHasShownSaveModal] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  
  const currentQuestion = getCurrentQuestion();
  const { overallPercentage, pillarPercentages } = getProgress();

  // Load saved survey session when available
  useEffect(() => {
    if (surveySession && !isRetake) {
      console.log('Loading saved survey session:', surveySession);
      loadSavedAnswers(surveySession.answers, surveySession.id);
      setSurveySessionId(surveySession.id);
    }
  }, [surveySession, isRetake, loadSavedAnswers, setSurveySessionId]);

  // Show save modal after question 8 (index 7) if user is not logged in
  useEffect(() => {
    if (currentQuestionIndex >= 7 && !user && !hasShownSaveModal && Object.keys(answers).length > 0) {
      setShowSaveModal(true);
      setHasShownSaveModal(true);
    }
  }, [currentQuestionIndex, user, hasShownSaveModal, answers]);

  // Handle questionnaire completion
  useEffect(() => {
    if (questionFlow.length > 0 && currentQuestionIndex >= questionFlow.length) {
      console.log("Questionnaire completed, showing completion dialog");
      if (isAuthenticated) {
        // Complete the survey in the backend
        completeSurvey().then((result) => {
          if (result.success) {
            setShowCompletionDialog(true);
          }
        });
      } else {
        // For non-authenticated users, redirect to results
        navigate('/results');
      }
    }
  }, [currentQuestionIndex, questionFlow.length, navigate, answers, isAuthenticated, completeSurvey]);

  const handleSaveProgress = async () => {
    if (user && surveySession) {
      // Save all current answers to the backend
      for (const [questionId, answer] of Object.entries(answers)) {
        await saveAnswer(questionId, answer);
      }
      setShowSaveModal(false);
    }
  };

  const handleContinueWithoutSaving = () => {
    setShowSaveModal(false);
  };

  const handleConfirmCancel = () => {
    navigate('/results');
  };

  const handleCompletionAction = async () => {
    setShowCompletionDialog(false);
    // Navigate to results page
    navigate('/results');
  };

  // Enhanced answer handling with backend save
  const handleAnswerQuestion = (questionId: string, answer: any) => {
    actions.answerQuestion(
      questionId, 
      answer, 
      isAuthenticated ? saveAnswer : undefined
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center px-4 py-8 md:py-12">
          <div className="w-full max-w-5xl text-center">
            <h1 className="text-3xl font-bold text-gray-800 my-8">
              Loading your survey...
            </h1>
            <p className="text-lg text-gray-600">Please wait a moment.</p>
          </div>
        </main>
      </div>
    );
  }

  if (!currentQuestion) {
    // Handle completion state
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center px-4 py-8 md:py-12">
          <div className="w-full max-w-5xl text-center">
            <h1 className="text-3xl font-bold text-gray-800 my-8">
              {isAuthenticated ? 'Completing your survey...' : 'Calculating your results...'}
            </h1>
            <p className="text-lg text-gray-600">Please wait a moment.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Header />
      <main className="flex-grow flex flex-col items-center px-4 py-8 md:py-12">
        <div className="w-full max-w-5xl">
          <div className="flex justify-between items-center mb-8">
            <QuestionnaireHeader currentQuestion={currentQuestionIndex + 1} totalQuestions={questionFlow.length} />
            {isRetake && user && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost">Cancel and Return to Results</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Your progress on this retake will be lost. You can always start again from the results page.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Continue Retake</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmCancel} className={buttonVariants({ variant: "destructive" })}>Yes, Cancel</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Building Your 5-Year Snapshot
            </h1>
            {isResuming && (
              <p className="text-lg text-purple-600 mt-2">
                Welcome back! Continuing from question {currentQuestionIndex + 1}
              </p>
            )}
          </div>
          
          <PillarStatus pillarPercentages={pillarPercentages} />
          <QuestionBox 
            key={currentQuestion.id}
            question={currentQuestion}
            value={answers[currentQuestion.id]}
            onAnswer={handleAnswerQuestion}
          />
          <OverallProgressBar value={overallPercentage} />
        </div>
      </main>

      <SaveProgressModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSaveProgress={handleSaveProgress}
        onContinueWithoutSaving={handleContinueWithoutSaving}
      />

      <SurveyCompletionDialog
        isOpen={showCompletionDialog}
        onClose={handleCompletionAction}
        onMakePublic={makePublic}
      />
    </div>
  );
};

export default Questionnaire;
