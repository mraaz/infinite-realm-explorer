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
  role: "ai" | "user" | "feedback";
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
  // --- MODIFICATION 1 of 3: Create a ref for the textarea input ---
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [conversationState, setConversationState] =
    useState<QuestionnaireStatePayload | null>(null);

  const orderedPillars = [
    priorities.mainFocus,
    priorities.secondaryFocus,
    ...priorities.maintenance,
  ];

  // --- Initial Data Loading & Resuming Progress ---
  useEffect(() => {
    const loadState = async () => {
      if (!authToken) return;
      const savedState = await getQuestionnaireState(authToken);
      if (
        savedState &&
        savedState.priorities &&
        savedState.answers?.history?.length > 0
      ) {
        setConversationState(savedState);
        setMessages(savedState.answers.history);
      } else {
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
        const firstQuestion = initialQuestions[orderedPillars[0]];
        const firstMessage = {
          id: 1,
          role: "ai",
          content: firstQuestion,
        } as Message;
        const stateWithFirstMessage = {
          ...initialState,
          answers: { ...initialState.answers, history: [firstMessage] },
        };
        setConversationState(stateWithFirstMessage);
        setMessages([firstMessage]);
      }
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
      currentHistory.findLast((m) => m.role === "ai")?.content || "";
    const aiQuestionCount = currentHistory.filter(
      (m) => m.role === "ai"
    ).length;

    let pillarIndex = 0;
    if (aiQuestionCount > 2) pillarIndex = 1;
    if (aiQuestionCount > 4) pillarIndex = 2;
    if (aiQuestionCount > 5) pillarIndex = 3;
    const currentPillar = orderedPillars[pillarIndex];

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: userInput.trim(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput("");
    setIsProcessing(true);

    const aiResponse = await processChatAnswer(
      {
        pillarName: currentPillar,
        previousQuestion: lastQuestion,
        userAnswer: userMessage.content,
      },
      authToken!
    );

    const newHistory = [...currentHistory, userMessage];

    if (aiResponse.isRelevant && aiResponse.nextQuestion) {
      const aiMessage: Message = {
        id: Date.now() + 1,
        role: "ai",
        content: aiResponse.nextQuestion,
      };
      newHistory.push(aiMessage);

      setConversationState((prev) => {
        const newState = { ...prev! };
        newState.answers.history = newHistory;
        newState.answers.scores[currentPillar] =
          (newState.answers.scores[currentPillar] || 0) + aiResponse.score;
        newState.answers.questionCount[currentPillar] =
          (newState.answers.questionCount[currentPillar] || 0) + 1;
        return newState;
      });
    } else {
      const feedbackMessage: Message = {
        id: Date.now() + 1,
        role: "feedback",
        content: aiResponse.feedback!,
      };
      newHistory.push(feedbackMessage);
      setConversationState((prev) => ({
        ...prev!,
        answers: { ...prev!.answers, history: newHistory },
      }));
    }
    setMessages(newHistory);
    setIsProcessing(false);

    const totalAIQuestions = newHistory.filter((m) => m.role === "ai").length;
    if (totalAIQuestions >= 6) {
      onComplete(conversationState!);
    }
  };

  // --- MODIFICATION 2 of 3: Update the useEffect for scrolling and focusing ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    // Set focus back to the input field after messages update
    inputRef.current?.focus();
  }, [messages]);

  // --- Progress Calculation for UI ---
  const getPillarInfo = () => {
    if (!conversationState)
      return { name: orderedPillars[0], type: "Main Focus" };
    const aiQuestionCount = conversationState.answers.history.filter(
      (m) => m.role === "ai"
    ).length;
    if (aiQuestionCount <= 2)
      return { name: priorities.mainFocus, type: "Main Focus" };
    if (aiQuestionCount <= 4)
      return { name: priorities.secondaryFocus, type: "Secondary Focus" };
    return {
      name: orderedPillars[Math.min(aiQuestionCount - 3, 3)],
      type: "Maintenance",
    };
  };

  const pillarInfo = getPillarInfo();
  const questionsInPillar = pillarInfo.type === "Maintenance" ? 1 : 2;
  const currentQuestionNum =
    conversationState?.answers.questionCount[pillarInfo.name] || 0;
  const overallCompleted = conversationState
    ? Object.values(conversationState.answers.questionCount).reduce(
        (a, b) => a + b,
        0
      )
    : 0;
  const progressPercentage = Math.round((overallCompleted / 6) * 100);

  // --- Render Logic ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-4">
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
              Question {Math.min(currentQuestionNum + 1, questionsInPillar)} of{" "}
              {questionsInPillar}
            </span>
            <span className="text-xs text-gray-400">
              Overall: {overallCompleted} of 6 ({progressPercentage}%)
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
                  msg.role === "ai"
                    ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white"
                    : "bg-gradient-to-br from-gray-600 to-gray-700 text-white"
                )}
              >
                {msg.role === "ai" ? "✨" : "😰"}
              </div>
            )}
            <div
              className={cn(
                "px-4 py-3 rounded-2xl shadow-sm max-w-[80%]",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground ml-auto"
                  : msg.role === "ai"
                  ? "bg-gray-100 text-gray-800"
                  : "bg-red-100 border border-red-200 text-red-800"
              )}
            >
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
        {/* --- MODIFICATION 3 of 3: Attach the ref to the Textarea --- */}
        <Textarea
          ref={inputRef}
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
