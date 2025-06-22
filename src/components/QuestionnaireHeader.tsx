
import { Sparkles } from 'lucide-react';

const QuestionnaireHeader = ({ currentQuestion, totalQuestions }: { currentQuestion: number; totalQuestions: number }) => {
  return (
    <header className="py-4 px-6 md:px-10 flex justify-between items-center w-full max-w-7xl mx-auto">
      <div className="flex items-center space-x-2">
        <Sparkles className="h-7 w-7 text-purple-400" />
        <span className="text-xl font-semibold text-white">LifePath</span>
      </div>
      { totalQuestions > 0 && (
        <div className="text-sm font-medium text-gray-400 bg-gray-800 px-3 py-1.5 rounded-full border border-gray-600">
          Question {currentQuestion} of {totalQuestions}
        </div>
      )}
    </header>
  );
};

export default QuestionnaireHeader;
