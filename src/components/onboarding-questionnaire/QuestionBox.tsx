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
  onPrevious: () => void; // Assuming you have a way to go back
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
  // This component no longer needs its own internal state for the slider.
  // It will be fully controlled by the parent `QuestionBox`.

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
          className="bg-gray-800 border-gray-700 text-white"
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
              value === "Yes" ? "bg-purple-600" : "bg-gray-800"
            )}
          >
            Yes
          </Button>
          <Button
            onClick={() => onChange("No")}
            variant={value === "No" ? "default" : "outline"}
            className={cn(
              "w-32",
              value === "No" ? "bg-purple-600" : "bg-gray-800"
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
                "w-full justify-start text-left py-4 h-auto",
                value === option ? "bg-purple-600" : "bg-gray-800"
              )}
              onClick={() => onChange(option)}
            >
              {option}
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
              className="absolute -top-8 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-md"
              style={{ left: `calc(${sliderPosition}% - 16px)` }}
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
  onSubmit,
  isSubmitting,
  onPrevious,
  isFirstQuestion,
}: QuestionBoxProps) => {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    // When the question changes, reset the internal value.
    // For sliders, we can default to 5 if no value exists.
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
    <div className="bg-[#1e1e24] p-8 rounded-2xl w-full max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-white mb-6 text-center">
        {question.question}
      </h2>
      <div className="mb-6 min-h-[5rem] flex justify-center items-center">
        {/* --- THIS IS THE FIX --- */}
        {/* We add the question.id as a key to force a full remount on every question change. */}
        <QuestionInput
          key={question.id}
          question={question}
          value={internalValue}
          onChange={setInternalValue}
        />
      </div>
      <div className="flex justify-between items-center mt-8">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isFirstQuestion || isSubmitting}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button onClick={handleNext} disabled={!isAnswered || isSubmitting}>
          {isSubmitting ? "Submitting..." : "Next"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default QuestionBox;
