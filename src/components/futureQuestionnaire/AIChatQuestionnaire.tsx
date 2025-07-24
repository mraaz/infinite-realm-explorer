import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import TextareaAutosize from "react-textarea-autosize";
import { Send, Loader2, ChevronDown, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { Pillar } from "@/components/priority-ranking/types";
import { useAuth } from "@/contexts/AuthContext";
import {
  getQuestionnaireState,
  saveQuestionnaireProgress,
  processChatAnswer,
  QuestionnaireStatePayload,
  AIResponse,
} from "@/services/apiService";

// --- Type Definitions ---
interface Message {
  id: number;
  role: "ai" | "user" | "feedback" | "transition";
  content: string;
  suggestions?: string[];
}
interface AIChatQuestionnaireProps {
  priorities: {
    mainFocus: Pillar;
    secondaryFocus: Pillar;
    maintenance: Pillar[];
  };
  onComplete: (finalState: QuestionnaireStatePayload) => void;
}
const initialQuestions: Record<Pillar, string> = {
  Career:
    "Think ahead 5 years — what kind of work or projects would you be excited to wake up for? What sounds interesting or meaningful to you?",
  Financials:
    "If you felt financially stress-free in 5 years, what would that look like? What kind of lifestyle would you be living?",
  Health:
    "Imagine you're feeling your best — energised, confident, and healthy. What does a regular day look like for you?",
  Connections:
    "Who are the people you want to feel closest to in 5 years, and what kind of relationships do you want to have with them?",
};

export const AIChatQuestionnaire: React.FC<AIChatQuestionnaireProps> = ({
  priorities,
  onComplete,
}) => {
  const { authToken } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [conversationState, setConversationState] =
    useState<QuestionnaireStatePayload | null>(null);
  const [expandedMessageId, setExpandedMessageId] = useState<number | null>(
    null
  );

  const orderedPillars = [
    priorities.mainFocus,
    priorities.secondaryFocus,
    ...priorities.maintenance,
  ];

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
        setConversationState({
          ...initialState,
          answers: { ...initialState.answers, history: [firstMessage] },
        });
        setMessages([firstMessage]);
      }
      setIsLoading(false);
    };
    loadState();
  }, [authToken]);

  useEffect(() => {
    if (conversationState && !isLoading && authToken) {
      saveQuestionnaireProgress(conversationState, authToken!);
    }
  }, [conversationState, isLoading, authToken]);

  const getPillarInfo = (
    state: QuestionnaireStatePayload | null = conversationState
  ) => {
    if (!state || !priorities)
      return { name: "Loading..." as Pillar, type: "Main Focus" };
    const mainFocusCount =
      state.answers.questionCount[priorities.mainFocus] || 0;
    if (mainFocusCount < 2)
      return { name: priorities.mainFocus, type: "Main Focus" };
    return { name: priorities.secondaryFocus, type: "Secondary Focus" };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isProcessing || !conversationState) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: userInput.trim(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput("");
    setIsProcessing(true);

    const { name: currentPillar, type: pillarType } = getPillarInfo();
    const lastQuestion =
      conversationState.answers.history.findLast((m) => m.role === "ai")
        ?.content || "";
    const currentQuestionNumForPillar =
      (conversationState.answers.questionCount[currentPillar] || 0) + 1;
    const questionsNeededForPillar = pillarType === "Main Focus" ? 2 : 1;
    const nextPillarIndex = orderedPillars.indexOf(currentPillar) + 1;
    const nextPillar = orderedPillars[nextPillarIndex] || null;

    const overallCompleted = Object.values(
      conversationState.answers.questionCount
    ).reduce((a, b) => (a as number) + (b as number), 0);

    const isFinalAnswer = overallCompleted === 2; // Is it the 3rd question (index 2)?
    const shouldAttemptTransition =
      currentQuestionNumForPillar >= questionsNeededForPillar;

    try {
      const payload = {
        pillarName: currentPillar,
        previousQuestion: lastQuestion,
        userAnswer: userMessage.content,
        isTransition: shouldAttemptTransition && !isFinalAnswer,
        nextPillarName: nextPillar,
        isFinalAnswer: isFinalAnswer,
      };

      console.log("Sending payload to backend:", payload);

      const aiResponse = await processChatAnswer(payload, authToken!);

      console.log("AI Response Received:", aiResponse);

      let newHistory = [...conversationState.answers.history, userMessage];
      let tempState = JSON.parse(JSON.stringify(conversationState));
      let isActuallyTransition = false;

      if (aiResponse.isRelevant) {
        // Update score and question count
        tempState.answers.scores[currentPillar] =
          (tempState.answers.scores[currentPillar] || 0) + aiResponse.score;
        tempState.answers.questionCount[currentPillar] =
          currentQuestionNumForPillar;

        // Recalculate transition condition *after* AI accepts it
        const updatedCount = tempState.answers.questionCount[currentPillar];
        isActuallyTransition = updatedCount >= questionsNeededForPillar;

        if (isFinalAnswer) {
          // Add the hardcoded completion message instead of an AI question
          const completionMessage: Message = {
            id: Date.now() + 1,
            role: "transition", // Use 'transition' style for the message
            content:
              "You've completed the chat! Your blueprint can take 1-2 minutes to generate. Please be patient on the next screen. Click 'Next' to continue.",
          };
          newHistory.push(completionMessage);
          tempState.answers.history = newHistory;
          onComplete(tempState); // Signal completion to enable the 'Next' button
        } else if (isActuallyTransition && aiResponse.transitionMessage) {
          newHistory.push({
            id: Date.now() + 1,
            role: "transition",
            content: aiResponse.transitionMessage,
          });
          if (nextPillar) {
            newHistory.push({
              id: Date.now() + 2,
              role: "ai",
              content: initialQuestions[nextPillar],
            });
          }
        } else if (aiResponse.nextQuestion) {
          newHistory.push({
            id: Date.now() + 1,
            role: "ai",
            content: aiResponse.nextQuestion,
          });
        }

        tempState.answers.history = newHistory;
        setConversationState(tempState);
        setMessages(newHistory);

        const totalPillarsCompleted = Object.keys(
          tempState.answers.questionCount
        ).filter(
          (p) => tempState.answers.questionCount[p as Pillar] > 0
        ).length;

        if (isActuallyTransition && totalPillarsCompleted >= 2) {
          tempState.answers.history = newHistory;
          onComplete(tempState);
        }
      } else {
        // Handle irrelevant input
        const feedbackText =
          aiResponse.feedback ||
          aiResponse.transitionMessage ||
          "Please try rephrasing your answer.";
        const feedbackMessage: Message = {
          id: Date.now() + 1,
          role: "feedback",
          content: feedbackText,
          suggestions: aiResponse.suggestions || [],
        };
        newHistory.push(feedbackMessage);
      }

      tempState.answers.history = newHistory;
      setConversationState(tempState);
      setMessages(newHistory);
    } catch (error) {
      console.error("Chat submission failed:", error);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    inputRef.current?.focus();
  }, [messages]);

  const pillarInfo = getPillarInfo();
  const questionsInPillar = pillarInfo.type === "Main Focus" ? 2 : 1;
  const currentQuestionNumInPillar =
    conversationState?.answers.questionCount[pillarInfo.name] || 0;

  const overallCompleted = conversationState
    ? Object.values(conversationState.answers.questionCount).reduce(
        (a: number, b: number) => a + b,
        0
      )
    : 0;
  const progressPercentage = Math.round(
    ((overallCompleted as number) / 3) * 100
  );

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
              Question{" "}
              {Math.min(currentQuestionNumInPillar + 1, questionsInPillar)} of{" "}
              {questionsInPillar}
            </span>
            <span className="text-xs text-gray-400">
              Overall: {overallCompleted as number} of 3 ({progressPercentage}%)
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

      <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-2">
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col">
            <div
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
                      : msg.role === "transition"
                      ? "bg-gradient-to-br from-gray-400 to-gray-500 text-white"
                      : "bg-red-500 text-white"
                  )}
                >
                  {msg.role === "ai" ? "✨" : <Bot className="h-6 w-6" />}
                </div>
              )}
              <div
                className={cn(
                  "px-4 py-3 rounded-2xl shadow-sm max-w-[80%]",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground ml-auto"
                    : msg.role === "ai"
                    ? "bg-gray-100 text-gray-800"
                    : msg.role === "transition"
                    ? "bg-gray-700 text-gray-200 italic"
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

            {msg.role === "feedback" &&
              msg.suggestions &&
              msg.suggestions.length > 0 && (
                <div className="flex justify-start pl-14 mt-1">
                  {expandedMessageId === msg.id ? (
                    <div className="w-full max-w-[80%] space-y-2 mt-2">
                      {msg.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => setUserInput(suggestion)}
                          className="w-full text-left p-3 bg-purple-500/10 text-purple-300 rounded-lg border border-purple-500/20 hover:bg-purple-500/20 transition-all text-sm"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <Button
                      variant="link"
                      className="text-purple-400 hover:text-purple-300 px-1 h-auto py-1 text-xs"
                      onClick={() =>
                        setExpandedMessageId(
                          msg.id === expandedMessageId ? null : msg.id
                        )
                      }
                    >
                      Show examples <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>
              )}
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-center py-2">
            <Loader2 className="h-6 w-6 animate-spin text-purple-300" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex items-end gap-2 mt-auto">
        <TextareaAutosize
          ref={inputRef}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Share your thoughts..."
          className="flex-1 bg-gray-800 border-gray-700 text-white rounded-2xl p-3 resize-none shadow-sm focus-visible:ring-1 focus-visible:ring-purple-500"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          maxRows={5}
          disabled={isProcessing}
        />
        <Button
          type="submit"
          disabled={!userInput.trim() || isProcessing}
          size="icon"
          className="h-11 w-11 rounded-full flex-shrink-0 bg-purple-600 hover:bg-purple-700"
        >
          {isProcessing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </form>
    </div>
  );
};
