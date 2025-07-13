// /src/components/futureQuestionnaire/AIChatQuestionnaire.tsx (Scaffolding)

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Send, Loader2 } from "lucide-react";
import {
  Priorities,
  Pillar,
  Answers,
  PillarAnswers,
} from "@/components/priority-ranking/types";

// Define the shape of a single chat message
type Message = {
  role: "user" | "assistant";
  content: string;
};

// Define the props the component will receive
interface AIChatQuestionnaireProps {
  priorities: Priorities;
  onComplete: (pillarName: Pillar, pillarAnswers: PillarAnswers) => void;
}

export const AIChatQuestionnaire: React.FC<AIChatQuestionnaireProps> = ({
  priorities,
  onComplete,
}) => {
  // State for the conversation messages
  const [messages, setMessages] = useState<Message[]>([]);
  // State for the user's current input
  const [inputValue, setInputValue] = useState("");
  // State to show a loading indicator while the "AI" is "thinking"
  const [isLoading, setIsLoading] = useState(false);

  // A ref to the scrollable message container
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Effect to kick off the conversation with a welcome message
  useEffect(() => {
    setIsLoading(true);
    // Simulate the AI starting the conversation
    setTimeout(() => {
      setMessages([
        {
          role: "assistant",
          content: `Hello! I see your main focus is on ${priorities.mainFocus}. To start, can you describe what your ideal future looks like in this area 5 years from now?`,
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }, [priorities.mainFocus]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: inputValue };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);

    // --- Placeholder for Supabase Edge Function Call ---
    // In the real implementation, you would send `priorities` and `newMessages`
    // to your 'questionnaire-chat' edge function here.
    try {
      // const aiResponse = await callSupabaseFunction(priorities, newMessages);
      // For now, we just simulate a delay and an echo response.
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const aiResponse = {
        response: `That's a great goal. This is where the next question would go. You said: "${userMessage.content}"`,
        isComplete: false, // Your function would determine when this is true
      };

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiResponse.response },
      ]);

      // If the AI signals the conversation is complete, call the onComplete prop
      if (aiResponse.isComplete) {
        // You would need to construct the final 'answers' object from the conversation
        const finalAnswers: PillarAnswers = {}; // Placeholder
        onComplete(priorities.mainFocus, finalAnswers);
      }
    } catch (error) {
      console.error("Error calling AI function:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[60vh] bg-black/20 rounded-lg p-4">
      {/* Message Display Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={cn(
              "flex items-end gap-2",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "p-3 rounded-lg max-w-sm md:max-w-md",
                msg.role === "user"
                  ? "bg-purple-600 text-white rounded-br-none"
                  : "bg-gray-700 text-white rounded-bl-none"
              )}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="p-3 rounded-lg bg-gray-700 rounded-bl-none">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSendMessage}
        className="mt-4 flex items-center gap-2 border-t border-gray-700 pt-4"
      >
        <Textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your answer here..."
          className="bg-gray-800 border-gray-600 text-white resize-none"
          rows={1}
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
          size="icon"
          disabled={isLoading || !inputValue.trim()}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
};
