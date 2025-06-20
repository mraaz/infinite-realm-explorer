
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QuestionnaireHeader from "@/components/QuestionnaireHeader";
import PillarStatus from "@/components/PillarStatus";
import QuestionBox from "@/components/QuestionBox";
import OverallProgressBar from "@/components/OverallProgressBar";
import Header from "@/components/Header";
import { SaveProgressModal } from "@/components/SaveProgressModal";
import { useQuestionnaireStore } from "@/store/questionnaireStore";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { useSecureSurvey } from "@/hooks/useSecureSurvey";
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
  const { user } = useSecureAuth();
  const { saveSurveyProgress, loadSurveyProgress } = useSecureSurvey();
  const navigate = useNavigate();
  const location = useLocation();
  const isRetake = location.state?.retake === true;
  
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [hasShownSaveModal, setHasShownSaveModal] = useState(false);
  
  const currentQuestion = getCurrentQuestion();
  const { overallPercentage, pillarPercentages } = getProgress();

  // Load saved progress when user logs in
  useEffect(() => {
    if (user && !isRetake) {
      loadSurveyProgress().then(({ data }) => {
        if (data?.answers) {
          console.log('Loading saved progress:', data.answers);
          // Load the saved answers into the store
          Object.entries(data.answers).forEach(([questionId, answer]) => {
            actions.setAnswer(questionId, answer);
          });
        }
      });
    }
  }, [user, isRetake, loadSurveyProgress, actions]);

  // Show save modal after question 8 (index 7) if user is not logged in
  useEffect(() => {
    if (currentQuestionIndex >= 7 && !user && !hasShownSaveModal && Object.keys(answers).length > 0) {
      setShowSaveModal(true);
      setHasShownSaveModal(true);
    }
  }, [currentQuestionIndex, user, hasShownSaveModal, answers]);

  // Complete questionnaire
  useEffect(() => {
    if (questionFlow.length > 0 && currentQuestionIndex >= questionFlow.length) {
      console.log("Submitting questionnaire answers to backend:", JSON.stringify(answers, null, 2));
      navigate('/results');
    }
  }, [currentQuestionIndex, questionFlow.length, navigate, answers]);

  const handleSaveProgress = async () => {
    if (user) {
      await saveSurveyProgress(answers);
      setShowSaveModal(false);
    }
  };

  const handleContinueWithoutSaving = () => {
    setShowSaveModal(false);
  };

  const handleConfirmCancel = () => {
    navigate('/results');
  };

  if (!currentQuestion) {
    // Handle completion state
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center px-4 py-8 md:py-12">
          <div className="w-full max-w-5xl text-center">
            <h1 className="text-3xl font-bold text-gray-800 my-8">
              Calculating your results...
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
          <h1 className="text-3xl font-bold text-gray-800 text-center">
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

      <SaveProgressModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSaveProgress={handleSaveProgress}
        onContinueWithoutSaving={handleContinueWithoutSaving}
      />
    </div>
  );
};

export default Questionnaire;
