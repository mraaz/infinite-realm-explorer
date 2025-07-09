import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { MessageCircle, ArrowRight, CheckCircle } from "lucide-react";
import { Pillar, Priorities } from "../priority-ranking/types";
import { questionnaireData } from "./questionnaireData";

interface AIChatQuestionnaireProps {
  priorities: Priorities;
  onComplete: (answers: Record<Pillar, Record<string, string>>) => void;
}

interface CategoryProgress {
  total: number;
  completed: number;
  questions: Array<{ id: string; label: string; answer?: string }>;
}

export const AIChatQuestionnaire: React.FC<AIChatQuestionnaireProps> = ({
  priorities,
  onComplete,
}) => {
  console.log("🎯 AI Chat starting with priorities:", priorities);

  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Create the categories array with proper typing
  const categories: Array<{ pillar: Pillar; focusType: "main" | "secondary" | "maintenance" }> = [
    { pillar: priorities.mainFocus, focusType: "main" },
    { pillar: priorities.secondaryFocus, focusType: "secondary" },
    ...priorities.maintenance.map(pillar => ({ pillar, focusType: "maintenance" as const })),
  ];

  // Initialize answers with proper typing - create empty records for each pillar
  const [answers, setAnswers] = useState<Record<Pillar, Record<string, string>>>(() => {
    const initialAnswers = {} as Record<Pillar, Record<string, string>>;
    categories.forEach(({ pillar }) => {
      initialAnswers[pillar] = {};
    });
    return initialAnswers;
  });

  const [categoryProgress, setCategoryProgress] = useState<Record<string, CategoryProgress>>({});

  useEffect(() => {
    const progress: Record<string, CategoryProgress> = {};
    
    categories.forEach(({ pillar, focusType }) => {
      const questionSet = questionnaireData[pillar]?.[focusType];
      if (questionSet) {
        progress[pillar] = {
          total: questionSet.questions.length,
          completed: 0,
          questions: questionSet.questions.map(q => ({ id: q.id, label: q.label })),
        };
      }
    });
    
    setCategoryProgress(progress);
    console.log("📊 Category progress initialized:", progress);
  }, [priorities]);

  const getCurrentCategory = () => categories[currentCategoryIndex];
  
  const getCurrentQuestion = () => {
    const category = getCurrentCategory();
    if (!category) return null;
    
    const questionSet = questionnaireData[category.pillar]?.[category.focusType];
    return questionSet?.questions[currentQuestionIndex] || null;
  };

  const getTotalProgress = () => {
    const totalQuestions = Object.values(categoryProgress).reduce((sum, cat) => sum + cat.total, 0);
    const completedQuestions = Object.values(categoryProgress).reduce((sum, cat) => sum + cat.completed, 0);
    return totalQuestions > 0 ? (completedQuestions / totalQuestions) * 100 : 0;
  };

  const handleAnswerSubmit = async () => {
    const category = getCurrentCategory();
    const question = getCurrentQuestion();
    
    if (!category || !question || !currentAnswer.trim()) return;

    console.log(`💬 Submitting answer for ${category.pillar} - ${question.id}:`, currentAnswer);

    setIsLoading(true);

    try {
      // Store the answer
      setAnswers(prev => ({
        ...prev,
        [category.pillar]: {
          ...prev[category.pillar],
          [question.id]: currentAnswer.trim()
        }
      }));

      // Update progress
      setCategoryProgress(prev => {
        const updated = { ...prev };
        if (updated[category.pillar]) {
          updated[category.pillar] = {
            ...updated[category.pillar],
            completed: updated[category.pillar].completed + 1,
            questions: updated[category.pillar].questions.map(q => 
              q.id === question.id ? { ...q, answer: currentAnswer.trim() } : q
            )
          };
        }
        return updated;
      });

      // Move to next question or category
      const currentCategoryQuestions = categoryProgress[category.pillar]?.questions || [];
      
      if (currentQuestionIndex + 1 < currentCategoryQuestions.length) {
        // More questions in current category
        setCurrentQuestionIndex(prev => prev + 1);
        console.log(`➡️ Moving to next question in ${category.pillar}`);
      } else if (currentCategoryIndex + 1 < categories.length) {
        // Move to next category
        setCurrentCategoryIndex(prev => prev + 1);
        setCurrentQuestionIndex(0);
        console.log(`📂 Moving to next category: ${categories[currentCategoryIndex + 1]?.pillar}`);
      } else {
        // All categories completed
        console.log("🎉 All categories completed!");
        console.log("📋 Final answers:", answers);
        
        // Create final answers object with the new answer included
        const finalAnswers = {
          ...answers,
          [category.pillar]: {
            ...answers[category.pillar],
            [question.id]: currentAnswer.trim()
          }
        };
        
        onComplete(finalAnswers);
        return;
      }

      setCurrentAnswer("");
    } catch (error) {
      console.error("❌ Error submitting answer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const category = getCurrentCategory();
  const question = getCurrentQuestion();

  if (!category || !question) {
    return (
      <div className="text-center text-gray-400">
        <p>Loading questions...</p>
      </div>
    );
  }

  const progress = getTotalProgress();
  const categoryQuestionSet = questionnaireData[category.pillar]?.[category.focusType];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress indicator */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-400">
          <span>Step {currentCategoryIndex + 2} of 5: {category.pillar}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      {/* Category context */}
      <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-300">
            <MessageCircle className="h-5 w-5" />
            {categoryQuestionSet?.title || `${category.pillar} Focus`}
          </CardTitle>
          <p className="text-gray-300 text-sm">
            {categoryQuestionSet?.description || `Let's explore your ${category.pillar.toLowerCase()} aspirations.`}
          </p>
        </CardHeader>
      </Card>

      {/* Current question */}
      <Card className="bg-[#1e1e24] border-gray-700">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300 font-medium">
              Question {currentQuestionIndex + 1} of {categoryProgress[category.pillar]?.total || 0}
            </Label>
            <h3 className="text-xl text-white">{question.label}</h3>
          </div>

          <Textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Share your thoughts here..."
            className="min-h-[120px] bg-[#16161a] border-gray-600 text-white placeholder-gray-400"
            disabled={isLoading}
          />

          <div className="flex justify-end">
            <Button
              onClick={handleAnswerSubmit}
              disabled={!currentAnswer.trim() || isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                "Processing..."
              ) : currentCategoryIndex === categories.length - 1 && 
                 currentQuestionIndex === (categoryProgress[category.pillar]?.total || 1) - 1 ? (
                <>
                  Complete <CheckCircle className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Category overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map(({ pillar }, index) => {
          const catProgress = categoryProgress[pillar];
          const isActive = index === currentCategoryIndex;
          const isCompleted = index < currentCategoryIndex;
          
          return (
            <Card 
              key={pillar}
              className={`transition-all ${
                isActive 
                  ? 'border-purple-500 bg-purple-900/20' 
                  : isCompleted
                  ? 'border-green-500/50 bg-green-900/10'
                  : 'border-gray-700 bg-[#1e1e24]'
              }`}
            >
              <CardContent className="p-4 text-center">
                <div className={`font-medium mb-2 ${
                  isActive ? 'text-purple-300' : isCompleted ? 'text-green-300' : 'text-gray-400'
                }`}>
                  {pillar}
                </div>
                <div className="text-sm text-gray-500">
                  {catProgress ? `${catProgress.completed}/${catProgress.total}` : '0/0'}
                </div>
                {isCompleted && (
                  <CheckCircle className="h-4 w-4 text-green-400 mx-auto mt-2" />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
