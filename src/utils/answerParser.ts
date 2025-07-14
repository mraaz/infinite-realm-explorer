// Utility to parse AWS conversation history into readable answer summaries
import { Pillar } from "@/components/priority-ranking/types";

interface Message {
  role: "user" | "hero" | "doubt" | "feedback" | "ai";
  content: string;
}

type Priorities = {
  mainFocus: Pillar;
  secondaryFocus: Pillar;
  maintenance: Pillar[];
};

type ParsedAnswers = {
  [key in Pillar]?: {
    responses: string[];
    summary: string;
  };
};

export const parseConversationToAnswers = (
  history: Message[],
  priorities: Priorities
): ParsedAnswers => {
  console.log("🔍 Parsing conversation history:", history.length, "messages");
  
  const orderedPillars = [
    priorities.mainFocus,
    priorities.secondaryFocus,
    ...priorities.maintenance,
  ];

  // Extract user responses
  const userMessages = history.filter(msg => msg.role === "user");
  console.log("👤 Found user messages:", userMessages.length);

  const parsedAnswers: ParsedAnswers = {};

  // Map responses to pillars based on sequence
  // Main Focus: first 2 responses, Secondary: next 2, Maintenance: 1 each
  let responseIndex = 0;

  // Main Focus (2 responses)
  if (userMessages[responseIndex] || userMessages[responseIndex + 1]) {
    const responses = [
      userMessages[responseIndex]?.content || "",
      userMessages[responseIndex + 1]?.content || ""
    ].filter(Boolean);
    
    parsedAnswers[priorities.mainFocus] = {
      responses,
      summary: responses.join(" ").slice(0, 200) + (responses.join(" ").length > 200 ? "..." : "")
    };
    responseIndex += 2;
  }

  // Secondary Focus (2 responses)
  if (userMessages[responseIndex] || userMessages[responseIndex + 1]) {
    const responses = [
      userMessages[responseIndex]?.content || "",
      userMessages[responseIndex + 1]?.content || ""
    ].filter(Boolean);
    
    parsedAnswers[priorities.secondaryFocus] = {
      responses,
      summary: responses.join(" ").slice(0, 200) + (responses.join(" ").length > 200 ? "..." : "")
    };
    responseIndex += 2;
  }

  // Maintenance pillars (1 response each)
  priorities.maintenance.forEach((pillar, index) => {
    const response = userMessages[responseIndex + index]?.content;
    if (response) {
      parsedAnswers[pillar] = {
        responses: [response],
        summary: response.slice(0, 200) + (response.length > 200 ? "..." : "")
      };
    }
  });

  console.log("✅ Parsed answers:", Object.keys(parsedAnswers));
  return parsedAnswers;
};