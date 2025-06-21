
import { useLocation } from 'react-router-dom';
import QuestionnaireHeader from "@/components/QuestionnaireHeader";
import PillarStatus from "@/components/PillarStatus";
import QuestionBox from "@/components/QuestionBox";
import OverallProgressBar from "@/components/OverallProgressBar";
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
import { useSecureAuth } from "@/hooks/useSecureAuth";

interface QuestionnaireContentProps {
  currentQuestion: any;
  currentQuestionIndex: number;
  questionFlowLength: number;
  answers: Record<string, any>;
  pillarPercentages: any;
  overallPercentage: number;
  isResuming: boolean;
  onAnswer: (questionId: string, answer: any) => void;
  onConfirmCancel: () => void;
}

const QuestionnaireContent = ({
  currentQuestion,
  currentQuestionIndex,
  questionFlowLength,
  answers,
  pillarPercentages,
  overallPercentage,
  isResuming,
  onAnswer,
  onConfirmCancel
}: QuestionnaireContentProps) => {
  const location = useLocation();
  const { user } = useSecureAuth();
  const isRetake = location.state?.retake === true;

  return (
    <div className="w-full max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <QuestionnaireHeader currentQuestion={currentQuestionIndex + 1} totalQuestions={questionFlowLength} />
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
                <AlertDialogAction onClick={onConfirmCancel} className={buttonVariants({ variant: "destructive" })}>Yes, Cancel</AlertDialogAction>
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
        onAnswer={onAnswer}
      />
      <OverallProgressBar value={overallPercentage} />
    </div>
  );
};

export default QuestionnaireContent;
