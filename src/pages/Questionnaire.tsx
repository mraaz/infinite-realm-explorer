
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SaveProgressModal } from "@/components/SaveProgressModal";
import { SurveyCompletionDialog } from "@/components/SurveyCompletionDialog";
import { useQuestionnaireStore } from "@/store/questionnaireStore";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { useSurveySession } from "@/hooks/useSurveySession";
import { logDebug, logInfo, logError } from '@/utils/logger';
import QuestionnaireLayout from '@/components/questionnaire/QuestionnaireLayout';
import QuestionnaireContent from '@/components/questionnaire/QuestionnaireContent';
import LoadingState from '@/components/questionnaire/LoadingState';

const Questionnaire = () => {
  const { actions, answers, currentQuestionIndex, questionFlow } = useQuestionnaireStore();
  const { getCurrentQuestion, getProgress, loadSavedAnswers, setSurveySessionId } = actions;
  const { user } = useSecureAuth();
  const { 
    surveySession, 
    isLoading, 
    isResuming, 
    isCompleting,
    saveAnswer, 
    completeSurvey, 
    makePublic, 
    storePendingProgress,
    isAuthenticated 
  } = useSurveySession();
  const navigate = useNavigate();
  const location = useLocation();
  const isRetake = location.state?.retake === true;
  
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [hasShownSaveModal, setHasShownSaveModal] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [isCompletionProcessed, setIsCompletionProcessed] = useState(false);
  
  const currentQuestion = getCurrentQuestion();
  const { overallPercentage, pillarPercentages } = getProgress();
  const isQuestionnaireComplete = questionFlow.length > 0 && currentQuestionIndex >= questionFlow.length;

  // Load saved survey session when available
  useEffect(() => {
    if (surveySession && !isRetake) {
      logDebug('Loading saved survey session:', surveySession);
      loadSavedAnswers(surveySession.answers, surveySession.id);
      setSurveySessionId(surveySession.id);
    }
  }, [surveySession, isRetake, loadSavedAnswers, setSurveySessionId]);

  // Handle post-authentication resume
  useEffect(() => {
    if (user && isAuthenticated && !isLoading) {
      const shouldReturnToQuestionnaire = localStorage.getItem('shouldReturnToQuestionnaire');
      if (shouldReturnToQuestionnaire === 'true') {
        setShowSaveModal(false);
        setHasShownSaveModal(true);
        localStorage.removeItem('shouldReturnToQuestionnaire');
        logInfo("User returned after authentication, continuing questionnaire");
      }
    }
  }, [user, isAuthenticated, isLoading]);

  // Show save modal after question 8 (index 7) if user is not logged in
  useEffect(() => {
    if (currentQuestionIndex >= 7 && !user && !hasShownSaveModal && Object.keys(answers).length > 0) {
      logInfo("Showing save progress modal at question", currentQuestionIndex + 1);
      setShowSaveModal(true);
      setHasShownSaveModal(true);
    }
  }, [currentQuestionIndex, user, hasShownSaveModal, answers]);

  // Handle questionnaire completion with better error handling
  useEffect(() => {
    if (isQuestionnaireComplete && !isCompletionProcessed && !isCompleting && !isLoading) {
      logInfo("Questionnaire completed, processing completion");
      setIsCompletionProcessed(true);
      
      if (isAuthenticated && surveySession) {
        logInfo("Authenticated user - attempting survey completion");
        completeSurvey()
          .then((result) => {
            logInfo("Survey completion result:", result);
            if (result.success) {
              logInfo("Survey completed successfully, showing completion dialog");
              setShowCompletionDialog(true);
            } else {
              logError("Survey completion failed, resetting completion state");
              setIsCompletionProcessed(false);
              // Navigate to results anyway to prevent getting stuck
              setTimeout(() => {
                logInfo("Navigating to results after failed completion");
                navigate('/results');
              }, 2000);
            }
          })
          .catch((error) => {
            logError("Survey completion error:", error);
            setIsCompletionProcessed(false);
            // Navigate to results anyway to prevent getting stuck
            setTimeout(() => {
              logInfo("Navigating to results after completion error");
              navigate('/results');
            }, 2000);
          });
      } else {
        logInfo("Unauthenticated user - storing answers in memory and navigating to results");
        // Store answers in memory for unauthenticated users
        const completedSurvey = {
          answers,
          completedAt: new Date().toISOString(),
          isTemporary: true // Flag to indicate this is a temporary, non-saved survey
        };
        localStorage.setItem('temporarySurveyResults', JSON.stringify(completedSurvey));
        navigate('/results');
      }
    }
  }, [
    isQuestionnaireComplete, 
    isCompletionProcessed, 
    isCompleting, 
    isLoading,
    isAuthenticated, 
    surveySession,
    completeSurvey, 
    navigate,
    answers
  ]);

  const handleSaveProgress = async () => {
    logDebug("Save progress requested");
    if (user && surveySession) {
      for (const [questionId, answer] of Object.entries(answers)) {
        await saveAnswer(questionId, answer);
      }
      setShowSaveModal(false);
    }
  };

  const handleContinueWithoutSaving = () => {
    logDebug("User chose to continue without saving");
    if (!user) {
      // Store answers in memory for potential results generation
      storePendingProgress(answers, currentQuestionIndex);
      
      // Also store a backup in localStorage for reliability
      const progressData = {
        answers,
        currentQuestionIndex,
        timestamp: new Date().toISOString(),
        isTemporary: true
      };
      localStorage.setItem('temporaryQuestionnaireProgress', JSON.stringify(progressData));
    }
    setShowSaveModal(false);
  };

  const handleConfirmCancel = () => {
    logDebug("User cancelled questionnaire");
    navigate('/');
  };

  const handleCompletionAction = () => {
    logDebug("Survey completion action triggered");
    setShowCompletionDialog(false);
    navigate('/results');
  };

  const handleAnswerQuestion = (questionId: string, answer: any) => {
    logDebug("Answer submitted:", { questionId, answer, isAuthenticated });
    actions.answerQuestion(
      questionId, 
      answer, 
      isAuthenticated ? saveAnswer : undefined
    );
  };

  if (isLoading) {
    return (
      <QuestionnaireLayout>
        <div className="w-full max-w-5xl text-center">
          <h1 className="text-3xl font-bold text-gray-800 my-8">
            Loading your survey...
          </h1>
          <p className="text-lg text-gray-600">Please wait a moment.</p>
        </div>
      </QuestionnaireLayout>
    );
  }

  if (!currentQuestion && !isQuestionnaireComplete) {
    return (
      <QuestionnaireLayout>
        <LoadingState isAuthenticated={isAuthenticated} isCompleting={isCompleting} />
      </QuestionnaireLayout>
    );
  }

  if (isQuestionnaireComplete && (isCompleting || !isCompletionProcessed)) {
    return (
      <QuestionnaireLayout>
        <div className="w-full max-w-5xl text-center">
          <h1 className="text-3xl font-bold text-gray-800 my-8">
            Completing your survey...
          </h1>
          <p className="text-lg text-gray-600">
            {isAuthenticated ? 'Processing your results and creating your profile...' : 'Finalizing your assessment...'}
          </p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        </div>
      </QuestionnaireLayout>
    );
  }

  return (
    <QuestionnaireLayout>
      <QuestionnaireContent
        currentQuestion={currentQuestion}
        currentQuestionIndex={currentQuestionIndex}
        questionFlowLength={questionFlow.length}
        answers={answers}
        pillarPercentages={pillarPercentages}
        overallPercentage={overallPercentage}
        isResuming={isResuming}
        onAnswer={handleAnswerQuestion}
        onConfirmCancel={handleConfirmCancel}
      />

      <SaveProgressModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSaveProgress={handleSaveProgress}
        onContinueWithoutSaving={handleContinueWithoutSaving}
        currentAnswers={answers}
        currentStep={currentQuestionIndex}
      />

      <SurveyCompletionDialog
        isOpen={showCompletionDialog}
        onClose={handleCompletionAction}
        onMakePublic={makePublic}
      />
    </QuestionnaireLayout>
  );
};

export default Questionnaire;
