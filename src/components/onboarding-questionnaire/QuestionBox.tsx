import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { YearPicker } from "@/components/ui/year-picker";
import { Question } from "@/store/onboardingQuestionnaireStore";
import { cn } from "@/lib/utils";

interface QuestionBoxProps {
  question: Question;
  value: any;
  answerQuestion: (id: string, value: any) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  isFirstQuestion: boolean;
}

const QuestionInput = ({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: any;
  onChange: (value: any) => void;
}) => {
  const [sliderValue, setSliderValue] = useState(value);

  const handleSliderChange = (values: number[]) => {
    const newValue = values[0];
    setSliderValue(newValue);
    onChange(newValue);
  };

  // This useEffect ensures the slider value resets when the question changes
  useEffect(() => {
    setSliderValue(value);
  }, [value, question.id]);

  switch (question.type) {
    case "year":
      return (
        <YearPicker
          year={value}
          setYear={onChange}
          placeholder="Select your birth year"
          yearRange={80}
        />
      );

    case "text":
      return (
        <Input
          placeholder={question.placeholder || "Type your answer..."}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"
        />
      );

    case "yes-no":
      return (
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => onChange("Yes")}
            variant={value === "Yes" ? "default" : "outline"}
            className={cn(
              "w-32",
              value === "Yes"
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-gray-800 hover:bg-gray-700 border-gray-700"
            )}
          >
            Yes
          </Button>
          <Button
            onClick={() => onChange("No")}
            variant={value === "No" ? "default" : "outline"}
            className={cn(
              "w-32",
              value === "No"
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-gray-800 hover:bg-gray-700 border-gray-700"
            )}
          >
            No
          </Button>
        </div>
      );

    case "multiple-choice":
      return (
        <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
          {question.options?.map((option) => (
            <Button
              key={option}
              variant={value === option ? "default" : "outline"}
              className={cn(
                "w-full justify-start text-left py-4 text-base transition-all h-auto whitespace-normal",
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
      const sliderPosition = sliderValue ? ((sliderValue - 1) / 9) * 100 : 50;
      return (
        <div className="w-full max-w-sm mx-auto pt-2 relative">
          {sliderValue && (
            <div
              className="absolute -top-8 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-md"
              style={{ left: `calc(${sliderPosition}% - 16px)` }}
            >
              {sliderValue}
            </div>
          )}
          <Slider
            value={sliderValue ? [sliderValue] : undefined}
            min={1}
            max={10}
            step={1}
            onValueChange={handleSliderChange}
            className="[&>span:first-child]:bg-purple-500 [&>span]:bg-gray-700"
          />
          <div className="flex justify-between text-sm text-gray-400 mt-2">
            <span>{question.sliderLabels?.min}</span>
            <span>{question.sliderLabels?.max}</span>
          </div>
        </div>
      );

    default:
      return (
        <p className="text-red-500">
          Unsupported question type: {question.type}
        </p>
      );
  }
};

const QuestionBox = ({
  question,
  value,
  answerQuestion,
  nextQuestion,
  previousQuestion,
  isFirstQuestion,
}: QuestionBoxProps) => {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value, question.id]);

  const handleNext = () => {
    answerQuestion(question.id, internalValue);
    nextQuestion();
  };

  const isAnswered =
    internalValue !== undefined &&
    internalValue !== null &&
    internalValue !== "";

  return (
    <div className="bg-[#1e1e24] p-6 sm:p-8 rounded-2xl shadow-2xl ring-1 ring-white/10 w-full max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-white mb-6 text-center">
        {question.question}
      </h2>

      <div className="mb-6 min-h-[5rem] flex justify-center items-center">
        <QuestionInput
          question={question}
          value={internalValue}
          onChange={setInternalValue}
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-center mt-8 gap-4 sm:gap-2">
        <Button
          variant="outline"
          onClick={previousQuestion}
          disabled={isFirstQuestion}
          className="w-full sm:w-auto bg-transparent hover:bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-600 disabled:opacity-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={!isAnswered}
          className="w-full sm:w-auto bg-gradient-cta text-white font-bold disabled:opacity-50"
        >
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default QuestionBox;
