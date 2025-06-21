
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SaveProgressModal } from "@/components/SaveProgressModal";
import { SurveyCompletionDialog } from "@/components/SurveyCompletionDialog";
import { useQuestionnaireStore } from "@/store/questionnaireStore";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { useSurveySession } from "@/hooks/useSurveySession";
import { logDebug, logInfo } from '@/utils/logger';
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
  const [hasCompletedSurvey, setHasCompletedSurvey] = useState(false);
  
  const currentQuestion = getCurrentQuestion();
  const { overallPercentage, pillarPercentages } = getProgress();

  // Load saved survey session when available
  useEffect(() => {
    if (surveySession && !isRetake) {
      logDebug('Loading saved survey session:', surveySession);
      loadSavedAnswers(surveySession.answers, surveySession.id);
      setSurveySessionId(surveySession.id);
    }
  }, [surveySession, isRetake, loadSavedAnswers, setSurveySessionId]);

  // Show save modal after question 8 (index 7) if user is not logged in
  useEffect(() => {
    if (currentQuestionIndex >= 7 && !user && !hasShownSaveModal && Object.keys(answers).length > 0) {
      logInfo("Showing save progress modal at question", currentQuestionIndex + 1);
      setShowSaveModal(true);
      setHasShownSaveModal(true);
    }
  }, [currentQuestionIndex, user, hasShownSaveModal, answers]);

  // Handle questionnaire completion - ONLY ONCE
  useEffect(() => {
    if (questionFlow.length > 0 && 
        currentQuestionIndex >= questionFlow.length && 
        !hasCompletedSurvey && 
        !isCompleting) {
      
      logInfo("Questionnaire completed, processing completion");
      setHasCompletedSurvey(true);
      
      if (isAuthenticated) {
        completeSurvey().then((result) => {
          if (result.success) {
            setShowCompletionDialog(true);
          } else {
            setHasCompletedSurvey(false);
          }
        });
      } else {
        navigate('/results');
      }
    }
  }, [currentQuestionIndex, questionFlow.length, hasCompletedSurvey, isCompleting, isAuthenticated, completeSurvey, navigate]);

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
      storePendingProgress(answers, currentQuestionIndex);
    }
    setShowSaveModal(false);
  };

  const handleConfirmCancel = () => {
    logDebug("User cancelled questionnaire");
    navigate('/results');
  };

  const handleCompletionAction = async () => {
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

  if (!currentQuestion) {
    return (
      <QuestionnaireLayout>
        <LoadingState isAuthenticated={isAuthenticated} isCompleting={isCompleting} />
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
