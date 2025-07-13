import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Pillar } from "@/components/priority-ranking/types";
import { useAuth } from "@/contexts/AuthContext";
import {
  getQuestionnaireState,
  saveQuestionnaireProgress,
  processChatAnswer,
  generateDialogue,
  QuestionnaireStatePayload,
} from "@/services/apiService";

// --- Type Definitions ---
type Priorities = {
  mainFocus: Pillar;
  secondaryFocus: Pillar;
  maintenance: Pillar[];
};

interface Message {
  id: number;
  role: "ai" | "user" | "feedback" | "hero" | "doubt";
  content: string;
}

interface AIChatQuestionnaireProps {
  priorities: Priorities;
  onComplete: (finalState: QuestionnaireStatePayload) => void;
}

const initialQuestions: Record<Pillar, string> = {
  Career:
    "When you picture yourself thriving in your dream career 5 years from now, what work are you doing that makes you lose track of time?",
  Financials:
    "Describe your ideal financial situation in 5 years. What does financial freedom look and feel like to you?",
  Health:
    "Imagine it's 5 years from now and you are in peak health. What does your daily routine look like, and how do you feel?",
  Connections:
    "Envision your relationships in 5 years. How are you connecting with the most important people in your life?",
};

export const AIChatQuestionnaire: React.FC<AIChatQuestionnaireProps> = ({
  priorities,
  onComplete,
}) => {
  const { authToken } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [conversationState, setConversationState] =
    useState<QuestionnaireStatePayload | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);

  const orderedPillars = [
    priorities.mainFocus,
    priorities.secondaryFocus,
    ...priorities.maintenance,
  ];

  // --- Initial Data Loading & Resuming Progress ---
  useEffect(() => {
    const loadState = async () => {
      console.log("🔄 AIChatQuestionnaire: Starting to load state, authToken:", !!authToken);
      
      if (!authToken) {
        console.log("❌ No auth token, creating minimal fallback state");
        const fallbackState: QuestionnaireStatePayload = {
          priorities: priorities,
          answers: {
            history: [],
            scores: { Career: 0, Financials: 0, Health: 0, Connections: 0 },
            questionCount: { Career: 0, Financials: 0, Health: 0, Connections: 0 },
          },
        };
        
        try {
          // Generate initial dialogue even without auth token
          console.log("🎭 Generating initial dialogue for guests:", orderedPillars[0]);
          const firstDialogue = await generateDialogue(
            orderedPillars[0],
            1,
            2,
            'main',
            {}
          );
          
          const heroMessage = {
            id: 1,
            role: "hero",
            content: firstDialogue.heroMessage,
          } as Message;
          
          const doubtMessage = {
            id: 2,
            role: "doubt", 
            content: firstDialogue.doubtMessage,
          } as Message;
          
          const initialMessages = [heroMessage, doubtMessage];
          const stateWithMessages = {
            ...fallbackState,
            answers: { ...fallbackState.answers, history: initialMessages },
          };
          setConversationState(stateWithMessages);
          setMessages(initialMessages);
          console.log("✅ Guest state created with messages:", initialMessages);
        } catch (error) {
          console.error("❌ Error generating initial dialogue for guest:", error);
          setConversationState(fallbackState);
        }
        
        setIsLoading(false);
        return;
      }
      
      try {
        console.log("📡 Calling getQuestionnaireState...");
        const savedState = await getQuestionnaireState(authToken);
        console.log("📦 Received saved state:", savedState);
        
        if (
          savedState &&
          savedState.priorities &&
          savedState.answers?.history?.length > 0
        ) {
          console.log("✅ Found existing state, restoring...");
          setConversationState(savedState);
          setMessages(savedState.answers.history);
        } else {
          console.log("🆕 Creating fresh state...");
          const initialState: QuestionnaireStatePayload = {
            priorities: priorities,
            answers: {
              history: [],
              scores: { Career: 0, Financials: 0, Health: 0, Connections: 0 },
              questionCount: {
                Career: 0,
                Financials: 0,
                Health: 0,
                Connections: 0,
              },
            },
          };
          
          // Generate initial dialogue for first pillar
          console.log("🎭 Generating initial dialogue for:", orderedPillars[0]);
          const firstDialogue = await generateDialogue(
            orderedPillars[0],
            1,
            2, // 2 questions for main focus
            'main',
            {}
          );
          console.log("🎭 Generated dialogue:", firstDialogue);
          
          const heroMessage = {
            id: 1,
            role: "hero",
            content: firstDialogue.heroMessage,
          } as Message;
          
          const doubtMessage = {
            id: 2,
            role: "doubt", 
            content: firstDialogue.doubtMessage,
          } as Message;
          
          const initialMessages = [heroMessage, doubtMessage];
          const stateWithFirstMessages = {
            ...initialState,
            answers: { ...initialState.answers, history: initialMessages },
          };
          setConversationState(stateWithFirstMessages);
          setMessages(initialMessages);
          console.log("✅ Initial state created with messages:", initialMessages);
        }
      } catch (error) {
        console.error("❌ Error loading state:", error);
        // Create minimal fallback state
        const fallbackState: QuestionnaireStatePayload = {
          priorities: priorities,
          answers: {
            history: [],
            scores: { Career: 0, Financials: 0, Health: 0, Connections: 0 },
            questionCount: { Career: 0, Financials: 0, Health: 0, Connections: 0 },
          },
        };
        setConversationState(fallbackState);
      }
      
      console.log("🏁 AIChatQuestionnaire: Finished loading, setting isLoading to false");
      setIsLoading(false);
    };
    loadState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken]);

  // --- Auto-saving progress ---
  useEffect(() => {
    if (conversationState && !isLoading && authToken) {
      saveQuestionnaireProgress(conversationState, authToken);
    }
  }, [conversationState, isLoading, authToken]);

  // --- Handling User Submission ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isProcessing || !conversationState) return;

    const currentHistory = conversationState.answers.history;
    const lastQuestion =
      currentHistory.findLast((m) => m.role === "hero")?.content || "";
    const dialogueCount = Math.floor(currentHistory.filter(
      (m) => m.role === "hero" || m.role === "doubt"
    ).length / 2); // Each dialogue creates 2 messages

    // Determine the current pillar and focus type based on dialogue count
    let pillarIndex = 0;
    let focusType: 'main' | 'secondary' | 'maintenance' = 'main';
    let questionNumber = 1;
    let totalQuestions = 2;
    
    if (dialogueCount >= 2) { // After 2 main focus dialogues
      pillarIndex = 1;
      focusType = 'secondary';
      questionNumber = dialogueCount - 1; // 1 or 2
    }
    if (dialogueCount >= 4) { // After 2 secondary focus dialogues
      pillarIndex = 2;
      focusType = 'maintenance';
      questionNumber = 1;
      totalQuestions = 1;
    }
    if (dialogueCount >= 5) { // After first maintenance dialogue
      pillarIndex = 3;
      focusType = 'maintenance';
      questionNumber = 1;
      totalQuestions = 1;
    }
    
    const currentPillar = orderedPillars[pillarIndex];

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: userInput.trim(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput("");
    setIsProcessing(true);

    try {
      // Process answer with AWS backend only if we have auth token
      let aiResponse = {
        isRelevant: true,
        score: 1,
        nextQuestion: null,
        feedback: "Thank you for sharing your thoughts."
      };
      
      if (authToken) {
        aiResponse = await processChatAnswer(
          {
            pillarName: currentPillar,
            previousQuestion: lastQuestion,
            userAnswer: userMessage.content,
          },
          authToken
        );
      } else {
        console.log("🔄 Guest mode: Using default AI response");
      }

    const newHistory = [...currentHistory, userMessage];

    // Update scores and question count based on AWS response
    setConversationState((prev) => {
      const newState = { ...prev! };
      newState.answers.history = newHistory;
      newState.answers.scores[currentPillar] =
        (newState.answers.scores[currentPillar] || 0) + aiResponse.score;
      newState.answers.questionCount[currentPillar] =
        (newState.answers.questionCount[currentPillar] || 0) + 1;
      return newState;
    });

    // Check if we need to generate next dialogue
    const shouldGenerateNext = dialogueCount < 5; // Generate next dialogue until we reach 6 total
    
    if (shouldGenerateNext) {
      // Determine next pillar and question details
      let nextPillarIndex = 0;
      let nextFocusType: 'main' | 'secondary' | 'maintenance' = 'main';
      let nextQuestionNumber = 1;
      let nextTotalQuestions = 2;
      
      if (dialogueCount >= 1) { // After 1st main focus dialogue
        nextPillarIndex = 0;
        nextFocusType = 'main';
        nextQuestionNumber = 2;
      }
      if (dialogueCount >= 2) { // After 2nd main focus dialogue
        nextPillarIndex = 1;
        nextFocusType = 'secondary';
        nextQuestionNumber = 1;
      }
      if (dialogueCount >= 3) { // After 1st secondary focus dialogue
        nextPillarIndex = 1;
        nextFocusType = 'secondary';
        nextQuestionNumber = 2;
      }
      if (dialogueCount >= 4) { // After 2nd secondary focus dialogue
        nextPillarIndex = 2;
        nextFocusType = 'maintenance';
        nextQuestionNumber = 1;
        nextTotalQuestions = 1;
      }
      if (dialogueCount >= 5) { // After 1st maintenance dialogue
        nextPillarIndex = 3;
        nextFocusType = 'maintenance';
        nextQuestionNumber = 1;
        nextTotalQuestions = 1;
      }
      
      const nextPillar = orderedPillars[nextPillarIndex];
      
      // Generate next dialogue
      const nextDialogue = await generateDialogue(
        nextPillar,
        nextQuestionNumber,
        nextTotalQuestions,
        nextFocusType,
        { [currentPillar]: userMessage.content }
      );
      
      const heroMessage: Message = {
        id: Date.now() + 1,
        role: "hero",
        content: nextDialogue.heroMessage,
      };
      
      const doubtMessage: Message = {
        id: Date.now() + 2,
        role: "doubt",
        content: nextDialogue.doubtMessage,
      };
      
      newHistory.push(heroMessage, doubtMessage);
    } else {
      // Show feedback message when complete
      const feedbackMessage: Message = {
        id: Date.now() + 1,
        role: "feedback",
        content: aiResponse.feedback || "Brilliant work! You've completed all 6 reflection dialogues. Let's review your insights.",
      };
      newHistory.push(feedbackMessage);
    }

    setMessages(newHistory);
    const updatedState = {
      ...conversationState!,
      answers: { ...conversationState!.answers, history: newHistory },
    };
    setConversationState(updatedState);
    setIsProcessing(false);

    // Check if we're complete (6 dialogues total)
    if (dialogueCount >= 5) { // This is the 6th dialogue (0-indexed)
      console.log("🎉 All 6 dialogues completed! Setting completion state");
      setShowCompletion(true);
    }
  } catch (error) {
    console.error("❌ Error in handleSubmit:", error);
    setIsProcessing(false);
  }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Progress Calculation for UI ---
  const getPillarInfo = () => {
    if (!conversationState)
      return { name: orderedPillars[0], type: "Main Focus" };
    const dialogueCount = Math.floor(conversationState.answers.history.filter(
      (m) => m.role === "hero" || m.role === "doubt"
    ).length / 2);
    if (dialogueCount <= 2)
      return { name: priorities.mainFocus, type: "Main Focus" };
    if (dialogueCount <= 4)
      return { name: priorities.secondaryFocus, type: "Secondary Focus" };
    return {
      name: orderedPillars[Math.min(dialogueCount - 2, 3)],
      type: "Maintenance",
    };
  };

  const pillarInfo = getPillarInfo();
  const questionsInPillar = pillarInfo.type === "Maintenance" ? 1 : 2;
  
  // Calculate current question number based on dialogue count and pillar
  const totalDialogues = conversationState ? Math.floor(conversationState.answers.history.filter(
    (m) => m.role === "hero" || m.role === "doubt"
  ).length / 2) : 0;
  
  let currentQuestionNum = 1;
  if (pillarInfo.type === "Main Focus") {
    currentQuestionNum = Math.min(totalDialogues, 2);
  } else if (pillarInfo.type === "Secondary Focus") {
    currentQuestionNum = Math.min(totalDialogues - 2, 2);
  } else { // Maintenance
    currentQuestionNum = 1; // Always 1 for maintenance
  }
  
  const progressPercentage = Math.round((totalDialogues / 6) * 100);

  // Handle completion transition
  const handleContinueToReview = () => {
    if (conversationState) {
      console.log("✅ User chose to continue to review, calling onComplete");
      onComplete(conversationState);
    }
  };

  // --- Render Logic ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  // Show completion state with user-controlled transition
  if (showCompletion) {
    return (
      <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto p-8 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-4xl animate-pulse">
          🎉
        </div>
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white">
            Incredible Work!
          </h3>
          <p className="text-gray-300 text-lg leading-relaxed">
            You've completed all 6 reflection dialogues. Your insights are now ready to be transformed into your personalized Future Self Blueprint.
          </p>
          <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4 mt-6">
            <p className="text-emerald-300 text-sm">
              ✓ 6 dialogues completed<br/>
              ✓ Insights captured across all life pillars<br/>
              ✓ Ready for blueprint generation
            </p>
          </div>
        </div>
        <Button
          onClick={handleContinueToReview}
          size="lg"
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-8 py-3 text-lg"
        >
          Continue to Review Your Blueprint
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-4">
      {/* --- PROGRESS BAR ADDED BACK --- */}
      <div className="sticky top-4 z-10 mb-6 p-5 bg-gradient-to-br from-gray-800/60 to-gray-900/80 border border-purple-500/30 rounded-2xl shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-600 to-purple-700 animate-pulse shadow-lg"></div>
            <span className="font-semibold text-white">
              Step 2: {pillarInfo.type}
            </span>
            <span className="text-purple-300">({pillarInfo.name})</span>
          </div>
          <div className="flex flex-col sm:items-end gap-1">
            <span className="text-gray-300 font-medium">
              Question {currentQuestionNum} of {questionsInPillar}
            </span>
            <span className="text-xs text-gray-400">
              Overall: {totalDialogues} of 6 dialogues ({progressPercentage}%)
            </span>
          </div>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-3 mt-4 overflow-hidden border border-gray-600/30">
          <div
            className="bg-gradient-to-r from-purple-600 to-purple-700 h-3 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex items-start gap-4",
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            {msg.role !== "user" && (
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold shadow-lg",
                  msg.role === "hero"
                    ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"
                    : msg.role === "doubt"
                    ? "bg-gradient-to-br from-amber-500 to-amber-600 text-white"
                    : msg.role === "ai"
                    ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white"
                    : "bg-gradient-to-br from-gray-600 to-gray-700 text-white"
                )}
              >
                {msg.role === "hero" ? "🌟" : msg.role === "doubt" ? "😟" : msg.role === "ai" ? "✨" : "😰"}
              </div>
            )}
            <div
              className={cn(
                "px-4 py-3 rounded-2xl shadow-sm max-w-[80%]",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground ml-auto"
                  : msg.role === "hero"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : msg.role === "doubt"
                  ? "bg-amber-50 border border-amber-200 text-amber-800"
                  : msg.role === "ai"
                  ? "bg-gray-100 text-gray-800"
                  : "bg-red-100 border border-red-200 text-red-800"
              )}
            >
              {(msg.role === "hero" || msg.role === "doubt") && (
                <div className="text-xs font-semibold mb-1 uppercase tracking-wide">
                  {msg.role === "hero" ? "Your Future Self speaks:" : "Your Inner Doubt whispers:"}
                </div>
              )}
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </p>
            </div>
            {msg.role === "user" && (
              <div className="w-10 h-10 rounded-full flex-shrink-0" />
            )}
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-purple-300" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <Textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Share your thoughts..."
          className="flex-1 min-h-[50px] resize-none bg-card border-border text-foreground"
          disabled={isProcessing}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button
          type="submit"
          disabled={!userInput.trim() || isProcessing}
          size="lg"
          className="h-[50px]"
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
};
