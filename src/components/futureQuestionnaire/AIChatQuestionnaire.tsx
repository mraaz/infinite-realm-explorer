import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Priorities,
  Pillar,
  Answers,
} from "@/components/priority-ranking/types";

// Define the shape of a single chat message with role types for Hero/Villain
type Message = {
  role: "user" | "hero" | "villain";
  content: string;
};

// Define the props the component will receive
interface AIChatQuestionnaireProps {
  priorities: Priorities;
  onComplete: (answers: Answers) => void;
}

// Question flow logic: First=3, Second=3, Third=1, Fourth=1
const getQuestionCount = (categoryIndex: number): number => {
  return categoryIndex < 2 ? 3 : 1;
};

// Initial Hero prompts for each category
const initialHeroPrompts = {
  "Career": "Imagine it's five years from now… what does your *dream career* look like? What's different, what's exciting? *Try closing your eyes for 10 seconds to picture it first.*",
  "Financials": "Five years ahead—what's your *ideal financial situation*? Paint me the lifestyle or feeling, not just the bank balance. *What would financial ease feel like for you?*",
  "Health": "In five years, how do you want to *feel* in your body, mind, and energy? *Not about perfection—what's 'healthy enough' for your happiest self?*",
  "Connections": "Five years from now—what do you want your *relationships and connections* to look and feel like? *Think close friends, family, your community vibe.*"
};

export const AIChatQuestionnaire: React.FC<AIChatQuestionnaireProps> = ({
  priorities,
  onComplete,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [isComplete, setIsComplete] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get ordered categories based on priorities
  const orderedCategories: Pillar[] = [
    priorities.mainFocus!,
    priorities.secondaryFocus!,
    ...priorities.maintenance
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Start the conversation with the first category
  useEffect(() => {
    if (orderedCategories.length > 0) {
      const firstCategory = orderedCategories[0];
      const heroPrompt = initialHeroPrompts[firstCategory];
      
      setMessages([
        {
          role: "hero",
          content: heroPrompt,
        },
      ]);
    }
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || isComplete) return;

    const userMessage: Message = { role: "user", content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const currentCategory = orderedCategories[currentCategoryIndex];
      
      // Call the Supabase edge function
      const { data, error } = await supabase.functions.invoke('future-self-dialogue', {
        body: {
          user_id: 'user_123', // In real app, get from auth context
          category: currentCategory,
          sequence: currentQuestionIndex,
          user_response: inputValue,
          existing_json: answers
        }
      });

      if (error) {
        throw error;
      }

      // Add Villain message first
      setMessages(prev => [...prev, {
        role: "villain",
        content: data.villain
      }]);

      // Add Hero message after a short delay (Hero always gets last word)
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: "hero",
          content: data.hero
        }]);

        // Update answers
        setAnswers(data.updated_json);

        // Determine next step
        const totalQuestionsForCategory = getQuestionCount(currentCategoryIndex);
        const isLastQuestionInCategory = currentQuestionIndex >= totalQuestionsForCategory - 1;
        const isLastCategory = currentCategoryIndex >= orderedCategories.length - 1;

        if (isLastQuestionInCategory) {
          if (isLastCategory) {
            // All questions completed
            setIsComplete(true);
            setTimeout(() => {
              onComplete(data.updated_json);
            }, 2000);
          } else {
            // Move to next category
            setTimeout(() => {
              const nextCategoryIndex = currentCategoryIndex + 1;
              const nextCategory = orderedCategories[nextCategoryIndex];
              const nextHeroPrompt = initialHeroPrompts[nextCategory];
              
              setCurrentCategoryIndex(nextCategoryIndex);
              setCurrentQuestionIndex(0);
              
              setMessages(prev => [...prev, {
                role: "hero",
                content: nextHeroPrompt
              }]);
            }, 1500);
          }
        } else {
          // Move to next question in same category
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
      }, 1000);

    } catch (error) {
      console.error("Error calling future-self-dialogue function:", error);
      setMessages(prev => [...prev, {
        role: "hero",
        content: "I'm having a moment of connection trouble, but let's continue. *Take a breath and share what's on your mind.*"
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Get current progress for display
  const totalQuestions = orderedCategories.reduce((total, _, index) => 
    total + getQuestionCount(index), 0);
  const completedQuestions = orderedCategories.slice(0, currentCategoryIndex)
    .reduce((total, _, index) => total + getQuestionCount(index), 0) + currentQuestionIndex;

  return (
    <div className="flex flex-col h-[70vh] max-w-4xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-4 p-3 bg-card rounded-lg border">
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>Category: {orderedCategories[currentCategoryIndex]} ({currentCategoryIndex + 1}/{orderedCategories.length})</span>
          <span>Question {completedQuestions + 1} of {totalQuestions}</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2 mt-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300" 
            style={{ width: `${((completedQuestions) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto space-y-4 bg-card rounded-lg p-4 border">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={cn(
              "flex w-full",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "p-4 rounded-lg max-w-[85%]",
                msg.role === "user" && "bg-primary text-primary-foreground",
                msg.role === "hero" && "bg-green-500/10 border border-green-500/20 text-green-100",
                msg.role === "villain" && "bg-red-500/10 border border-red-500/20 text-red-100"
              )}
            >
              {msg.role !== "user" && (
                <div className="font-semibold text-xs uppercase tracking-wide mb-2 opacity-70">
                  {msg.role === "hero" ? "Future You" : "Inner Doubt"}
                </div>
              )}
              <div 
                className="whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: msg.content.replace(/\*(.*?)\*/g, '<em>$1</em>')
                }}
              />
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="p-4 rounded-lg bg-muted border">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          </div>
        )}
        
        {isComplete && (
          <div className="flex justify-center">
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-100 text-center">
              🎉 Congratulations! Your Future Self journey is complete. Preparing your results...
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      {!isComplete && (
        <form
          onSubmit={handleSendMessage}
          className="mt-4 flex items-end gap-3"
        >
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Share your thoughts..."
            className="flex-1 min-h-[80px] resize-none"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <Button
            type="submit"
            size="lg"
            disabled={isLoading || !inputValue.trim()}
            className="h-[80px] px-6"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
      )}
    </div>
  );
};
