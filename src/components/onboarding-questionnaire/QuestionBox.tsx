
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
  onSubmit: (answer: any) => void;
  isSubmitting: boolean;
  onPrevious: () => void;
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
  const handleSliderChange = (values: number[]) => {
    onChange(values[0]);
  };

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
          className="bg-gray-800 border-gray-700 text-white w-full max-w-md mx-auto"
        />
      );
    case "yes-no":
      return (
        <div className="flex gap-4 justify-center flex-wrap">
          <Button
            onClick={() => onChange("Yes")}
            variant={value === "Yes" ? "default" : "outline"}
            className={cn(
              "w-32 h-12 text-base font-medium",
              value === "Yes" ? "bg-purple-600 hover:bg-purple-700" : "bg-gray-800 hover:bg-gray-700"
            )}
          >
            Yes
          </Button>
          <Button
            onClick={() => onChange("No")}
            variant={value === "No" ? "default" : "outline"}
            className={cn(
              "w-32 h-12 text-base font-medium",
              value === "No" ? "bg-purple-600 hover:bg-purple-700" : "bg-gray-800 hover:bg-gray-700"
            )}
          >
            No
          </Button>
        </div>
      );
    case "multiple-choice":
      return (
        <div className="flex flex-col gap-3 w-full max-w-lg mx-auto">
          {question.options?.map((option) => (
            <Button
              key={option}
              variant={value === option ? "default" : "outline"}
              className={cn(
                "w-full text-left py-4 px-4 h-auto min-h-[3rem] whitespace-normal break-words leading-relaxed",
                "justify-start items-center text-sm sm:text-base",
                value === option 
                  ? "bg-purple-600 hover:bg-purple-700 text-white" 
                  : "bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700"
              )}
              onClick={() => onChange(option)}
            >
              <span className="text-left w-full">{option}</span>
            </Button>
          ))}
        </div>
      );
    case "slider":
      const sliderPosition = value ? ((value - 1) / 9) * 100 : 50;
      return (
        <div className="w-full max-w-sm mx-auto pt-2 relative">
          {value && (
            <div
              className="absolute -top-8 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-md transform -translate-x-1/2"
              style={{ left: `${sliderPosition}%` }}
            >
              {value}
            </div>
          )}
          <Slider
            value={value ? [value] : [5]}
            min={1}
            max={10}
            step={1}
            onValueChange={handleSliderChange}
            className="[&>span:first-child]:bg-purple-500 [&>span]:bg-gray-700 [&>span>span]:bg-white"
          />
          <div className="flex justify-between text-xs sm:text-sm text-gray-400 mt-2 px-1">
            <span className="text-left max-w-[45%] break-words leading-tight">
              {question.sliderLabels?.min}
            </span>
            <span className="text-right max-w-[45%] break-words leading-tight">
              {question.sliderLabels?.max}
            </span>
          </div>
        </div>
      );
    default:
      return (
        <p className="text-red-500 text-center">
          Unsupported question type: {question.type}
        </p>
      );
  }
};

const QuestionBox = ({
  question,
  value,
  onSubmit,
  isSubmitting,
  onPrevious,
  isFirstQuestion,
}: QuestionBoxProps) => {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    if (question.type === "slider" && value === undefined) {
      setInternalValue(5);
    } else {
      setInternalValue(value);
    }
  }, [value, question.id, question.type]);

  const handleNext = () => {
    onSubmit(internalValue);
  };

  const isAnswered =
    internalValue !== undefined &&
    internalValue !== null &&
    internalValue !== "";

  return (
    <div className="bg-[#1e1e24] p-4 sm:p-6 md:p-8 rounded-2xl w-full max-w-3xl mx-auto">
      <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-6 text-center leading-relaxed break-words px-2">
        {question.question}
      </h2>
      
      <div className="mb-8 min-h-[5rem] flex justify-center items-center px-2">
        <QuestionInput
          key={question.id}
          question={question}
          value={internalValue}
          onChange={setInternalValue}
        />
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 px-2">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isFirstQuestion || isSubmitting}
          className="w-full sm:w-auto bg-transparent hover:bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-600 disabled:opacity-50 h-12 px-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={!isAnswered || isSubmitting}
          className="w-full sm:w-auto bg-gradient-cta hover:opacity-90 text-white font-bold h-12 px-8 disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Next"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default QuestionBox;
