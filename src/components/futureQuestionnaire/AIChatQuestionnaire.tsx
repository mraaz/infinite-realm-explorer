
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

// Full dialogue prompts structure for getting next question prompts
const dialoguePrompts = {
  "Career": [
    {
      "hero_prompt": "Imagine it's five years from now… what does your *dream career* look like? What's different, what's exciting? *Try closing your eyes for 10 seconds to picture it first.*"
    },
    {
      "hero_prompt": "Let's break it down: what are the *three biggest milestones* you'd love to hit in your career over the next five years? *First three things that pop up—no perfection needed.*"
    },
    {
      "hero_prompt": "Why does this matter to you? What's the *real* reason you want this change? *Your 'why' will fuel your follow-through.*"
    }
  ],
  "Financials": [
    {
      "hero_prompt": "Five years ahead—what's your *ideal financial situation*? Paint me the lifestyle or feeling, not just the bank balance. *What would financial ease feel like for you?*"
    },
    {
      "hero_prompt": "What are the *three biggest financial outcomes* you'd love to achieve by then? *Could be freedom from debt, a safety net, or a dream purchase.*"
    },
    {
      "hero_prompt": "Why do these money goals matter to you? What would change in your life if you made them real? *Think beyond dollars—what's the feeling?*"
    }
  ],
  "Health": [
    {
      "hero_prompt": "In five years, how do you want to *feel* in your body, mind, and energy? *Not about perfection—what's 'healthy enough' for your happiest self?*"
    },
    {
      "hero_prompt": "What are *three small but meaningful outcomes* you'd like for your health by then? *Could be sleeping better, moving more, or less stress.*"
    },
    {
      "hero_prompt": "Why does your health matter to you in the long run? What will it allow you to do, feel, or experience more of? *Your 'why' will make the how easier.*"
    }
  ],
  "Connections": [
    {
      "hero_prompt": "Five years from now—what do you want your *relationships and connections* to look and feel like? *Think close friends, family, your community vibe.*"
    },
    {
      "hero_prompt": "What are *three key outcomes* you'd love to see in your social or personal life by then? *Deeper friendships? New circles? Stronger bonds?*"
    },
    {
      "hero_prompt": "Why do these relationships matter to you? What would having them give you in your life? *Connection is fuel too—what does it mean to you?*"
    }
  ]
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
      
      // Get real user ID from auth context
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || 'anonymous';
      
      // Call the Supabase edge function
      const { data, error } = await supabase.functions.invoke('future-self-dialogue', {
        body: {
          user_id: userId,
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
          // Move to next question in same category - trigger next AI question
          const nextQuestionIndex = currentQuestionIndex + 1;
          setCurrentQuestionIndex(nextQuestionIndex);
          
          // If there are more questions in this category, trigger the next hero prompt
          if (nextQuestionIndex < totalQuestionsForCategory) {
            setTimeout(() => {
              // Get the next question prompt from the dialogue data
              const nextPrompt = dialoguePrompts[currentCategory]?.[nextQuestionIndex]?.hero_prompt || 
                               `Let's continue with question ${nextQuestionIndex + 1} about ${currentCategory}...`;
              
              setMessages(prev => [...prev, {
                role: "hero",
                content: nextPrompt
              }]);
            }, 1500);
          }
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

  // Get current progress for display aligned with 5-step flow
  const totalQuestions = orderedCategories.reduce((total, _, index) => 
    total + getQuestionCount(index), 0);
  const completedQuestions = orderedCategories.slice(0, currentCategoryIndex)
    .reduce((total, _, index) => total + getQuestionCount(index), 0) + currentQuestionIndex;
  
  // Calculate current step based on category progression (aligned with 5-step flow)
  const getCurrentStep = () => {
    if (currentCategoryIndex === 0) return 2; // Main Focus
    if (currentCategoryIndex === 1) return 3; // Secondary Focus
    if (currentCategoryIndex >= 2) return 4; // Maintenance
    return 2;
  };
  
  const getCurrentStepName = () => {
    if (currentCategoryIndex === 0) return "Main Focus";
    if (currentCategoryIndex === 1) return "Secondary Focus";
    if (currentCategoryIndex >= 2) return "Maintenance";
    return "Main Focus";
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-4">
      {/* Enhanced Progress indicator aligned with 5-step flow */}
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
          <span className="text-muted-foreground font-medium">
            Question {currentQuestionIndex + 1} of {getQuestionCount(currentCategoryIndex)}
          </span>
        </div>
        <div className="w-full bg-muted/30 rounded-full h-3 mt-4 overflow-hidden">
          <div 
            className="bg-gradient-cta h-3 rounded-full transition-all duration-700 ease-out shadow-sm" 
            style={{ width: `${((currentQuestionIndex + 1) / getQuestionCount(currentCategoryIndex)) * 100}%` }}
          />
        </div>
      </div>

      {/* Enhanced Chat messages container */}
      <div className="flex-1 overflow-y-auto space-y-6 bg-background/40 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-border/30 shadow-lg min-h-[60vh] max-h-[70vh]">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={cn(
              "flex w-full animate-fade-in",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {/* Character Avatar for Hero/Villain */}
            {msg.role !== "user" && (
              <div className="flex flex-col items-center mr-3 mt-1">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shadow-md mb-1",
                  msg.role === "hero" 
                    ? "bg-gradient-to-br from-primary to-primary/80 text-white" 
                    : "bg-gradient-to-br from-muted-foreground/20 to-muted-foreground/10 text-muted-foreground border border-muted-foreground/20"
                )}>
                  {msg.role === "hero" ? "✨" : "💭"}
                </div>
                <div className={cn(
                  "text-[10px] font-bold uppercase tracking-wider",
                  msg.role === "hero" ? "text-primary" : "text-black"
                )}>
                  {msg.role === "hero" ? "Future" : "Doubt"}
                </div>
              </div>
            )}

            <div className="flex flex-col max-w-[80%] sm:max-w-[75%]">
              {/* Character name header for better UX */}
              {msg.role !== "user" && (
                <div className={cn(
                  "text-xs font-semibold mb-2 px-2",
                  msg.role === "hero" ? "text-primary" : "text-black"
                )}>
                  {msg.role === "hero" ? "Your Future Self speaks:" : "Your Inner Doubt whispers:"}
                </div>
              )}

              <div
                className={cn(
                  "p-5 rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl",
                  msg.role === "user" && "bg-gradient-cta text-white border-transparent ml-auto relative",
                  msg.role === "hero" && "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 text-black backdrop-blur-sm",
                  msg.role === "villain" && "bg-gradient-to-br from-muted/80 to-muted/40 border-muted-foreground/20 text-black backdrop-blur-sm"
                )}
              >
                {/* Speech bubble tail for character messages */}
                {msg.role !== "user" && (
                  <div className={cn(
                    "absolute w-0 h-0 top-4 -left-2",
                    msg.role === "hero" 
                      ? "border-r-[8px] border-r-primary/20 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent"
                      : "border-r-[8px] border-r-muted border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent"
                  )} />
                )}

                <div 
                  className={cn(
                    "whitespace-pre-wrap leading-relaxed",
                    msg.role === "user" ? "text-sm sm:text-base" : "text-sm sm:text-base"
                  )}
                  dangerouslySetInnerHTML={{
                    __html: msg.content.replace(/\*(.*?)\*/g, '<em class="font-semibold not-italic text-current">$1</em>')
                  }}
                />
              </div>
            </div>

            {/* User Avatar */}
            {msg.role === "user" && (
              <div className="flex flex-col items-center ml-3 mt-1">
                <div className="w-10 h-10 rounded-full bg-gradient-cta flex items-center justify-center text-white text-lg font-bold shadow-md mb-1">
                  👤
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  You
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* Enhanced Loading State */}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="flex items-center mr-3 mt-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-muted-foreground/20 to-muted-foreground/10 flex items-center justify-center text-muted-foreground border border-muted-foreground/20 shadow-md">
                💭
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-gradient-to-br from-muted/80 to-muted/40 border border-muted-foreground/20 max-w-[80%] sm:max-w-[75%] shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm font-medium">Characters are thinking deeply...</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Enhanced Completion State */}
        {isComplete && (
          <div className="flex justify-center animate-fade-in">
            <div className="p-8 rounded-3xl bg-gradient-cta text-white text-center max-w-md shadow-2xl border border-white/10 backdrop-blur-sm">
              <div className="text-4xl mb-4 animate-bounce">🎉</div>
              <div className="text-xl font-bold mb-2">Journey Complete!</div>
              <div className="text-sm opacity-90 leading-relaxed">
                Your Future Self has spoken. Inner Doubt has been acknowledged. 
                <br />
                <em>Preparing your personalized insights...</em>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Input form */}
      {!isComplete && (
        <form
          onSubmit={handleSendMessage}
          className="mt-6 flex flex-col sm:flex-row items-end gap-4"
        >
          <div className="flex-1 relative">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Share your deepest thoughts and dreams..."
              className="flex-1 min-h-[100px] sm:min-h-[80px] resize-none text-base text-black bg-card/50 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-all duration-300 rounded-2xl p-4 shadow-lg"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
              Press Enter to send
            </div>
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={isLoading || !inputValue.trim()}
            className="h-[80px] px-8 sm:h-[100px] bg-gradient-cta hover:opacity-90 transition-all duration-300 w-full sm:w-auto rounded-2xl shadow-lg font-semibold text-base"
          >
            {isLoading ? (
              <div className="flex flex-col items-center gap-1">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-xs">Sending</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <Send className="h-6 w-6" />
                <span className="text-xs">Send</span>
              </div>
            )}
          </Button>
        </form>
      )}
    </div>
  );
};
