
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Question, pillarsInfo } from "@/data/questions";
import { useQuestionnaireStore } from "@/store/questionnaireStore";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { DatePicker } from "@/components/ui/date-picker";
import { YearPicker } from "@/components/ui/year-picker";


const QuestionInput = ({ question, value, onChange }: { question: Question, value: any, onChange: (value: any) => void }) => {
  switch (question.type) {
    case 'text':
      return (
        <div>
          <Input 
            placeholder="Type your answer..." 
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
          {question.suggestions && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {question.suggestions.map(suggestion => (
                <Button key={suggestion} variant="outline" size="sm" className="bg-gray-50 text-gray-700 hover:bg-gray-100" onClick={() => onChange(suggestion)}>
                  {suggestion}
                </Button>
              ))}
            </div>
          )}
        </div>
      );
    case 'multiple-choice':
      return (
        <div className="flex flex-col gap-3">
          {question.options?.map(option => (
            <Button
              key={option}
              variant={value === option ? 'default' : 'outline'}
              className={cn("w-full justify-start text-left py-6 text-base", value === option ? 'bg-gray-800 hover:bg-gray-900 text-white' : '')}
              onClick={() => onChange(option)}
            >
              {option}
            </Button>
          ))}
        </div>
      );
    case 'slider':
      return (
        <div className="pt-2">
          <Slider
            defaultValue={[value || 5]}
            min={1}
            max={10}
            step={1}
            onValueChange={(values) => onChange(values[0])}
          />
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>{question.sliderLabels?.min}</span>
            <span>{question.sliderLabels?.max}</span>
          </div>
        </div>
      );
    case 'date':
      // Use YearPicker for DOB question, regular date picker for others
      if (question.id === 'dob') {
        return (
          <YearPicker
            year={value}
            setYear={onChange}
            placeholder="Select your birth year"
            yearRange={80}
          />
        );
      }
      
      // Default date picker for other date questions
      return (
         <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !value && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? format(value, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={value}
              onSelect={onChange}
              initialFocus
              captionLayout="dropdown-buttons"
              fromYear={1920}
              toYear={new Date().getFullYear()}
            />
          </PopoverContent>
        </Popover>
      );
    case 'number':
       return (
        <Input 
          type="number"
          placeholder="Enter a number" 
          value={value || ''}
          onChange={(e) => onChange(e.target.valueAsNumber)}
        />
      );
    default:
      return <p>Unsupported question type</p>;
  }
};


const QuestionBox = ({ question, value }: { question: Question, value: any }) => {
  const { answerQuestion, nextQuestion, previousQuestion } = useQuestionnaireStore(state => state.actions);
  const [internalValue, setInternalValue] = useState(value);
  const currentQuestionIndex = useQuestionnaireStore(state => state.currentQuestionIndex);

  const handleNext = () => {
    answerQuestion(question.id, internalValue);
    nextQuestion();
  };

  const handlePrevious = () => {
    // We don't save on previous, just navigate
    previousQuestion();
  }

  const pillarInfo = question.pillar !== 'Basics' ? pillarsInfo[question.pillar] : null;
  const PillarIcon = pillarInfo?.icon;
  const isAnswered = internalValue !== undefined && internalValue !== null && internalValue !== '';

  return (
    <div className="bg-white/60 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200/80 w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        {pillarInfo && PillarIcon && (
          <Badge variant="outline" className={`border-${pillarInfo.color}-200 bg-${pillarInfo.color}-50 text-${pillarInfo.color}-700 font-medium`}>
            <PillarIcon className="h-4 w-4 mr-2" />
            {question.pillar}
          </Badge>
        )}
        {question.isOptional && (
          <Badge variant="secondary">Optional</Badge>
        )}
      </div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        {question.question}
      </h2>
      
      <div className="mb-6 min-h-[5rem]">
        <QuestionInput question={question} value={internalValue} onChange={setInternalValue} />
      </div>

      <div className="flex justify-between items-center mt-8">
        <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button onClick={handleNext} disabled={!isAnswered}>
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default QuestionBox;
