
import QuestionnaireHeader from "@/components/QuestionnaireHeader";
import PillarStatus from "@/components/PillarStatus";
import QuestionBox from "@/components/QuestionBox";
import OverallProgressBar from "@/components/OverallProgressBar";
import { questions } from "@/data/questions";
import Header from "@/components/Header";

const Questionnaire = () => {
  // We'll make this dynamic in the next step
  const currentQuestionNumber = 6; 
  const totalQuestions = 18; // Placeholder total
  const progress = 33;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow flex flex-col items-center px-4 py-8 md:py-12">
        <div className="w-full max-w-5xl">
          <QuestionnaireHeader currentQuestion={currentQuestionNumber} totalQuestions={totalQuestions} />
          <h1 className="text-3xl font-bold text-gray-800 my-8 text-center">
            Building Your 5-Year Snapshot
          </h1>
          <PillarStatus />
          <QuestionBox />
          <OverallProgressBar value={progress} />
        </div>
      </main>
    </div>
  );
};

export default Questionnaire;
