import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Question, pillarsInfo } from "@/data/questions";
import { useQuestionnaireStore } from "@/store/questionnaireStore";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { YearPicker } from "@/components/ui/year-picker";

// This component renders the correct input based on the question type.
// All styles have been updated for the dark theme.
const QuestionInput = ({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: any;
  onChange: (value: any) => void;
}) => {
  switch (question.type) {
    case "text":
      return (
        <div>
          <Input
            placeholder="Type your answer..."
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"
          />
          {question.suggestions && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {question.suggestions.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  className="bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600"
                  onClick={() => onChange(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          )}
        </div>
      );
    case "multiple-choice":
      return (
        <div className="flex flex-col gap-3">
          {question.options?.map((option) => (
            <Button
              key={option}
              variant={value === option ? "default" : "outline"}
              className={cn(
                "w-full justify-start text-left py-6 text-base transition-all",
                value === option
                  ? "bg-purple-600 hover:bg-purple-700 text-white border-purple-500"
                  : "bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-300 hover:border-purple-500"
              )}
              onClick={() => onChange(option)}
            >
              {option}
            </Button>
          ))}
        </div>
      );
    case "slider":
      return (
        <div className="pt-2">
          <Slider
            defaultValue={[value || 5]}
            min={1}
            max={10}
            step={1}
            onValueChange={(values) => onChange(values[0])}
            className="[&>span:first-child]:bg-purple-500"
          />
          <div className="flex justify-between text-sm text-gray-400 mt-2">
            <span>{question.sliderLabels?.min}</span>
            <span>{question.sliderLabels?.max}</span>
          </div>
        </div>
      );
    case "date":
      return (
        <YearPicker
          year={value}
          setYear={onChange}
          placeholder="Select your birth year"
          yearRange={80}
        />
      );
    case "number":
      return (
        <Input
          type="number"
          placeholder="Enter a number"
          value={value || ""}
          onChange={(e) => onChange(e.target.valueAsNumber)}
          className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"
        />
      );
    default:
      return <p className="text-red-500">Unsupported question type</p>;
  }
};

// This is the main QuestionBox component.
// The container has been updated to match the dark theme.
const QuestionBox = ({
  question,
  value,
}: {
  question: Question;
  value: any;
}) => {
  const { answerQuestion, nextQuestion, previousQuestion } =
    useQuestionnaireStore((state) => state.actions);
  const [internalValue, setInternalValue] = useState(value);
  const currentQuestionIndex = useQuestionnaireStore(
    (state) => state.currentQuestionIndex
  );

  const handleNext = () => {
    answerQuestion(question.id, internalValue);
    nextQuestion();
  };

  const handlePrevious = () => {
    previousQuestion();
  };

  const pillarInfo =
    question.pillar !== "Basics" ? pillarsInfo[question.pillar] : null;
  const PillarIcon = pillarInfo?.icon;
  const isAnswered =
    internalValue !== undefined &&
    internalValue !== null &&
    internalValue !== "";

  // Main container updated with dark theme classes
  return (
    <div className="bg-[#1e1e24] p-6 sm:p-8 rounded-2xl shadow-2xl ring-1 ring-white/10 w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        {pillarInfo && PillarIcon && (
          // Badge styling updated for dark theme
          <Badge
            variant="outline"
            className={`border-${pillarInfo.color}-500/30 bg-${pillarInfo.color}-500/10 text-${pillarInfo.color}-400 font-medium`}
          >
            <PillarIcon className="h-4 w-4 mr-2" />
            {question.pillar}
          </Badge>
        )}
        {question.isOptional && (
          <Badge
            variant="secondary"
            className="bg-gray-700 text-gray-300 border-gray-600"
          >
            Optional
          </Badge>
        )}
      </div>
      <h2 className="text-xl font-semibold text-white mb-6">
        {question.question}
      </h2>

      <div className="mb-6 min-h-[5rem]">
        <QuestionInput
          question={question}
          value={internalValue}
          onChange={setInternalValue}
        />
      </div>

      <div className="flex justify-between items-center mt-8">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="bg-transparent hover:bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={!isAnswered}
          className="bg-gradient-cta text-white font-bold disabled:opacity-50"
        >
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default QuestionBox;
