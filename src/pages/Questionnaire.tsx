
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QuestionnaireHeader from "@/components/QuestionnaireHeader";
import PillarStatus from "@/components/PillarStatus";
import QuestionBox from "@/components/QuestionBox";
import OverallProgressBar from "@/components/OverallProgressBar";
import Header from "@/components/Header";
import QuestionnaireLoginModal from "@/components/QuestionnaireLoginModal";
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
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [guestMode, setGuestMode] = useState(false);
  const [modalDismissed, setModalDismissed] = useState(false);
  
  const currentQuestion = getCurrentQuestion();
  const { overallPercentage, pillarPercentages } = getProgress();

  // Show login modal for non-authenticated users (but not on retakes)
  useEffect(() => {
    if (!isLoggedIn && !isRetake && !guestMode && !modalDismissed) {
      setShowLoginModal(true);
    }
  }, [isLoggedIn, isRetake, guestMode, modalDismissed]);

  useEffect(() => {
    if (questionFlow.length > 0 && currentQuestionIndex >= questionFlow.length) {
      console.log("Submitting questionnaire answers to backend:", JSON.stringify(answers, null, 2));
      navigate('/results');
    }
  }, [currentQuestionIndex, questionFlow.length, navigate, answers]);

  const handleConfirmCancel = () => {
    navigate('/results');
  };

  const handleContinueAsGuest = () => {
    setGuestMode(true);
    setModalDismissed(true);
  };

  const handleModalOpenChange = (open: boolean) => {
    setShowLoginModal(open);
    if (!open) {
      setModalDismissed(true);
    }
  };

  // Check if user has access to the questionnaire
  const hasQuestionnaireAccess = isLoggedIn || isRetake || guestMode;

  // If user dismissed modal without choosing guest mode and isn't logged in, show access denied
  if (!hasQuestionnaireAccess && modalDismissed) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center px-4 py-8 md:py-12">
          <div className="w-full max-w-2xl text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Access Required
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Please sign in or continue as a guest to access the questionnaire.
            </p>
            <div className="space-y-4">
              <Button
                onClick={() => {
                  setModalDismissed(false);
                  setShowLoginModal(true);
                }}
                className="w-full"
              >
                Show Login Options
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full"
              >
                Go Back Home
              </Button>
            </div>
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
            {isRetake && (
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
      
      <QuestionnaireLoginModal
        open={showLoginModal}
        onOpenChange={handleModalOpenChange}
        onContinueAsGuest={handleContinueAsGuest}
      />
    </div>
  );
};

export default Questionnaire;
