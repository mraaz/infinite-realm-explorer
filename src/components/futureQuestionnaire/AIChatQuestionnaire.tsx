
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Pillar } from "@/components/priority-ranking/types";

type Priorities = {
  mainFocus: Pillar;
  secondaryFocus: Pillar;
  maintenance: Pillar[];
};

interface Message {
  role: "hero" | "doubt" | "user";
  content: string;
}

interface AIChatQuestionnaireProps {
  priorities: Priorities;
  onComplete: (answers: Record<Pillar, Record<string, string>>) => void;
}

export const AIChatQuestionnaire: React.FC<AIChatQuestionnaireProps> = ({
  priorities,
  onComplete,
}) => {
  // Initialize ordered categories based on user's priorities
  const orderedCategories: Pillar[] = [
    priorities.mainFocus,
    priorities.secondaryFocus,
    ...priorities.maintenance,
  ];

  console.log("🎯 AIChatQuestionnaire initialized with priorities:", priorities);
  console.log("📋 Ordered categories:", orderedCategories);

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<Record<Pillar, Record<string, string>>>>({});
  const [hasStarted, setHasStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get question count based on category type - FIXED LOGIC
  const getQuestionCount = (categoryIndex: number): number => {
    if (categoryIndex === 0 || categoryIndex === 1) {
      // Main focus and secondary focus get 3 questions each
      return 3;
    } else {
      // Maintenance categories get 1 question each
      return 1;
    }
  };

  // Get current category info for logging
  const getCurrentCategoryInfo = () => {
    const category = orderedCategories[currentCategoryIndex];
    const isMainFocus = currentCategoryIndex === 0;
    const isSecondaryFocus = currentCategoryIndex === 1;
    const isMaintenance = currentCategoryIndex >= 2;
    const questionCount = getQuestionCount(currentCategoryIndex);
    
    return {
      category,
      isMainFocus,
      isSecondaryFocus,
      isMaintenance,
      questionCount,
      categoryIndex: currentCategoryIndex,
      questionIndex: currentQuestionIndex
    };
  };

  // Calculate overall progress for the progress bar
  const calculateOverallProgress = () => {
    let totalCompleted = 0;
    let totalQuestions = 0;

    // Count completed questions from previous categories
    for (let i = 0; i < currentCategoryIndex; i++) {
      totalCompleted += getQuestionCount(i);
      totalQuestions += getQuestionCount(i);
    }

    // Add current category progress
    totalCompleted += currentQuestionIndex;
    totalQuestions += getQuestionCount(currentCategoryIndex);

    // Add remaining categories to total
    for (let i = currentCategoryIndex + 1; i < orderedCategories.length; i++) {
      totalQuestions += getQuestionCount(i);
    }

    return { completed: totalCompleted, total: totalQuestions };
  };

  // Get current step for the 5-step flow visualization
  const getCurrentStep = (): number => {
    if (currentCategoryIndex === 0) return 2; // Main Focus
    if (currentCategoryIndex === 1) return 3; // Secondary Focus
    if (currentCategoryIndex >= 2) return 4; // Maintenance
    return 2;
  };

  const getCurrentStepName = (): string => {
    if (currentCategoryIndex === 0) return "Main Focus";
    if (currentCategoryIndex === 1) return "Secondary Focus"; 
    if (currentCategoryIndex >= 2) return "Maintenance";
    return "Main Focus";
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startChat = async () => {
    console.log("🚀 Starting chat for category:", getCurrentCategoryInfo());
    setHasStarted(true);
    await generateNextQuestion();
  };

  const generateNextQuestion = async () => {
    const categoryInfo = getCurrentCategoryInfo();
    console.log("❓ Generating question for:", categoryInfo);
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('future-self-dialogue', {
        body: {
          pillar: categoryInfo.category,
          questionNumber: categoryInfo.questionIndex + 1,
          totalQuestions: categoryInfo.questionCount,
          focusType: categoryInfo.isMainFocus ? 'main' : categoryInfo.isSecondaryFocus ? 'secondary' : 'maintenance',
          previousAnswers: answers[categoryInfo.category] || {},
          isFirstQuestion: categoryInfo.questionIndex === 0
        }
      });

      console.log("🔄 Edge function response:", { data, error });

      if (error) {
        console.error("❌ Error from edge function:", error);
        throw error;
      }

      if (data?.heroMessage && data?.doubtMessage) {
        setMessages(prev => [
          ...prev,
          { role: "hero", content: data.heroMessage },
          { role: "doubt", content: data.doubtMessage }
        ]);
        console.log("✅ Messages added successfully");
      } else {
        console.error("❌ Invalid response format:", data);
        throw new Error("Invalid response format from dialogue service");
      }
    } catch (error) {
      console.error("❌ Error generating question:", error);
      setMessages(prev => [
        ...prev,
        { role: "hero", content: "Let's talk about your vision for this area of your life." },
        { role: "doubt", content: "But are you really ready to commit to change?" }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim() || isLoading) return;

    const userMessage = currentInput.trim();
    const categoryInfo = getCurrentCategoryInfo();
    
    console.log("📝 User submitted answer:", {
      answer: userMessage,
      categoryInfo,
      currentAnswers: answers[categoryInfo.category] || {}
    });

    // Add user message
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setCurrentInput("");

    // Store the answer with proper question ID format
    const questionId = `q${categoryInfo.questionIndex + 1}`;
    const updatedAnswers = {
      ...answers,
      [categoryInfo.category]: {
        ...answers[categoryInfo.category],
        [questionId]: userMessage
      }
    };
    
    setAnswers(updatedAnswers);
    console.log("💾 Answer stored:", {
      category: categoryInfo.category,
      questionId,
      answer: userMessage,
      allAnswers: updatedAnswers
    });

    // Move to next question or category
    const nextQuestionIndex = categoryInfo.questionIndex + 1;
    const maxQuestions = categoryInfo.questionCount;

    if (nextQuestionIndex < maxQuestions) {
      // More questions in current category
      console.log(`➡️ Moving to question ${nextQuestionIndex + 1} in ${categoryInfo.category}`);
      setCurrentQuestionIndex(nextQuestionIndex);
      setTimeout(() => generateNextQuestion(), 1000);
    } else {
      // Move to next category or complete
      const nextCategoryIndex = categoryInfo.categoryIndex + 1;
      
      if (nextCategoryIndex < orderedCategories.length) {
        console.log(`🔄 Moving to next category: ${orderedCategories[nextCategoryIndex]} (index ${nextCategoryIndex})`);
        setCurrentCategoryIndex(nextCategoryIndex);
        setCurrentQuestionIndex(0);
        setTimeout(() => generateNextQuestion(), 1500);
      } else {
        // All categories completed
        console.log("🎉 All categories completed! Final answers:", updatedAnswers);
        console.log("📊 Answer summary:");
        Object.entries(updatedAnswers).forEach(([pillar, pillarAnswers]) => {
          console.log(`  ${pillar}:`, Object.keys(pillarAnswers).length, "answers");
          Object.entries(pillarAnswers).forEach(([qId, answer]) => {
            console.log(`    ${qId}: ${answer.substring(0, 50)}...`);
          });
        });
        onComplete(updatedAnswers as Record<Pillar, Record<string, string>>);
      }
    }
  };

  // Progress calculation
  const progress = calculateOverallProgress();
  const progressPercentage = Math.round((progress.completed / progress.total) * 100);

  if (!hasStarted) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Ready to Explore Your Future?</h2>
          <p className="text-gray-400 max-w-md">
            I'll guide you through a conversation about your vision for each priority area. 
            Let's dive deep and uncover what success really means to you.
          </p>
          <div className="text-sm text-gray-500 space-y-1">
            <div>📋 Categories to explore: {orderedCategories.join(", ")}</div>
            <div>📊 Total questions: {orderedCategories.reduce((total, _, index) => total + getQuestionCount(index), 0)}</div>
          </div>
        </div>
        <Button 
          onClick={startChat}
          size="lg" 
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Start the Journey
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-4">
      {/* Enhanced Progress indicator with detailed logging */}
      <div className="mb-6 p-5 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-gradient-cta animate-pulse"></div>
            <span className="font-semibold text-foreground">
              Step {getCurrentStep()}: {getCurrentStepName()}
            </span>
            <span className="text-muted-foreground">
              ({orderedCategories[currentCategoryIndex]})
            </span>
          </div>
          <div className="flex flex-col sm:items-end gap-1">
            <span className="text-muted-foreground font-medium">
              Question {currentQuestionIndex + 1} of {getQuestionCount(currentCategoryIndex)}
            </span>
            <span className="text-xs text-muted-foreground">
              Overall: {progress.completed} of {progress.total} ({progressPercentage}%)
            </span>
          </div>
        </div>
        <div className="w-full bg-muted/30 rounded-full h-3 mt-4 overflow-hidden">
          <div 
            className="bg-gradient-cta h-3 rounded-full transition-all duration-700 ease-out shadow-sm" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={cn(
              "flex gap-4 animate-in slide-in-from-bottom-4 duration-500",
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            {msg.role !== "user" && (
              <div className="flex flex-col items-center space-y-1 mt-1">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg",
                  msg.role === "hero" 
                    ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white" 
                    : "bg-gradient-to-br from-gray-600 to-gray-700 text-white"
                )}>
                  {msg.role === "hero" ? "✨" : "😰"}
                </div>
                <div className={cn(
                  "text-[10px] font-bold uppercase tracking-wider",
                  msg.role === "hero" ? "text-primary" : "text-gray-300"
                )}>
                  {msg.role === "hero" ? "Future" : "Doubt"}
                </div>
              </div>
            )}
            
            <div className={cn(
              "flex-1 max-w-[80%]",
              msg.role === "user" ? "text-right" : "text-left"
            )}>
              {msg.role !== "user" && (
                <div className={cn(
                  "text-xs font-semibold mb-2 px-2",
                  msg.role === "hero" ? "text-primary" : "text-gray-300"
                )}>
                  {msg.role === "hero" ? "Your Future Self speaks:" : "Your Inner Doubt whispers:"}
                </div>
              )}
              
              <div className={cn(
                "px-4 py-3 rounded-2xl shadow-sm",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground ml-auto"
                  : msg.role === "hero"
                  ? "bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 text-purple-900"
                  : "bg-gray-700 border border-gray-600 text-gray-100"
              )}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>
              </div>
            </div>

            {msg.role === "user" && (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg mt-1">
                You
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white animate-pulse">
              ✨
            </div>
            <div className="flex-1">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 px-4 py-3 rounded-2xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Textarea
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          placeholder="Share your thoughts..."
          className="flex-1 min-h-[60px] resize-none bg-card border border-border text-foreground placeholder:text-muted-foreground"
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button 
          type="submit" 
          disabled={!currentInput.trim() || isLoading}
          className="h-[60px] px-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
};
