
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, MessageSquare, ArrowRight } from "lucide-react";
import { Pillar, Priorities } from "@/components/priority-ranking/types";
import { questionnaireData } from "./questionnaireData";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AIChatQuestionnaireProps {
  priorities: Priorities;
  onComplete: (answers: Record<Pillar, Record<string, string>>) => void;
}

export const AIChatQuestionnaire: React.FC<AIChatQuestionnaireProps> = ({
  priorities,
  onComplete,
}) => {
  // Initialize answers with correct type structure
  const [answers, setAnswers] = useState<Record<Pillar, Record<string, string>>>(() => {
    const initialAnswers: Record<Pillar, Record<string, string>> = {
      Career: {},
      Health: {},
      Financials: {},
      Connections: {},
    };
    return initialAnswers;
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
    pillar?: Pillar;
  }>>([]);

  // Build the category sequence based on priorities
  const categorySequence: Array<{ pillar: Pillar; focusType: 'main' | 'secondary' | 'maintenance' }> = [
    { pillar: priorities.mainFocus!, focusType: 'main' as const },
    { pillar: priorities.secondaryFocus!, focusType: 'secondary' as const },
    ...priorities.maintenance.map(pillar => ({ pillar, focusType: 'maintenance' as const }))
  ];

  console.log('🎯 AIChatQuestionnaire - Category sequence:', categorySequence);

  const currentCategory = currentStep < categorySequence.length ? categorySequence[currentStep] : null;

  // Get expected question count for current category
  const getExpectedQuestionCount = (focusType: 'main' | 'secondary' | 'maintenance'): number => {
    return focusType === 'maintenance' ? 1 : 3;
  };

  const processWithAI = async (userInput: string) => {
    if (!currentCategory) return;

    setIsProcessing(true);
    console.log(`🤖 Processing AI for ${currentCategory.pillar} (${currentCategory.focusType})`);

    try {
      const expectedQuestions = getExpectedQuestionCount(currentCategory.focusType);
      const questionSet = questionnaireData[currentCategory.pillar][currentCategory.focusType];

      console.log(`📊 Expected questions for ${currentCategory.pillar}: ${expectedQuestions}`);
      console.log(`📋 Question set:`, questionSet);

      const { data, error } = await supabase.functions.invoke('future-self-dialogue', {
        body: {
          userInput,
          pillar: currentCategory.pillar,
          focusType: currentCategory.focusType,
          expectedQuestions,
          chatHistory: chatHistory.filter(msg => msg.pillar === currentCategory.pillar),
          questionContext: {
            title: questionSet?.title || `${currentCategory.pillar} Questions`,
            subtitle: questionSet?.subtitle || '',
            sampleQuestions: questionSet?.questions?.map(q => q.label) || []
          }
        }
      });

      if (error) {
        console.error('❌ AI processing error:', error);
        throw error;
      }

      console.log('✅ AI response received:', data);

      // Update chat history
      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: userInput, pillar: currentCategory.pillar },
        { role: 'assistant', content: data.response, pillar: currentCategory.pillar }
      ]);

      // Process extracted answers
      if (data.extractedAnswers && Object.keys(data.extractedAnswers).length > 0) {
        console.log(`📝 Extracted answers for ${currentCategory.pillar}:`, data.extractedAnswers);
        
        setAnswers(prev => ({
          ...prev,
          [currentCategory.pillar]: {
            ...prev[currentCategory.pillar],
            ...data.extractedAnswers
          }
        }));

        // Check if we have enough answers for this category
        const totalAnswers = Object.keys({
          ...answers[currentCategory.pillar],
          ...data.extractedAnswers
        }).length;

        console.log(`📊 ${currentCategory.pillar} answers: ${totalAnswers}/${expectedQuestions}`);

        if (totalAnswers >= expectedQuestions) {
          console.log(`✅ ${currentCategory.pillar} category complete!`);
          setTimeout(() => {
            setCurrentStep(prev => prev + 1);
          }, 1500);
        }
      }

    } catch (error) {
      console.error('❌ Error in AI processing:', error);
      toast.error('Failed to process your response. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Check if all categories are complete
  useEffect(() => {
    if (currentStep >= categorySequence.length) {
      console.log('🎉 All categories complete! Final answers:', answers);
      
      // Verify we have answers for all categories
      const missingCategories = categorySequence.filter(({ pillar, focusType }) => {
        const pillarAnswers = answers[pillar];
        const expectedCount = getExpectedQuestionCount(focusType);
        const actualCount = Object.keys(pillarAnswers || {}).length;
        console.log(`🔍 ${pillar}: ${actualCount}/${expectedCount} answers`);
        return actualCount < expectedCount;
      });

      if (missingCategories.length === 0) {
        console.log('✅ All categories have sufficient answers, calling onComplete');
        onComplete(answers);
      } else {
        console.log('⚠️ Missing answers for categories:', missingCategories.map(c => c.pillar));
      }
    }
  }, [currentStep, answers, categorySequence, onComplete]);

  if (!currentCategory) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          All Categories Complete!
        </h3>
        <p className="text-gray-400">
          Processing your responses...
        </p>
      </div>
    );
  }

  const expectedQuestions = getExpectedQuestionCount(currentCategory.focusType);
  const currentAnswers = answers[currentCategory.pillar] || {};
  const answeredCount = Object.keys(currentAnswers).length;
  const questionSet = questionnaireData[currentCategory.pillar][currentCategory.focusType];

  const progressPercentage = (answeredCount / expectedQuestions) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <span>Step {currentStep + 2} of 4</span>
          <span>•</span>
          <span>{currentCategory.pillar} ({currentCategory.focusType})</span>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">
            {questionSet?.title || `${currentCategory.pillar} Focus`}
          </h2>
          <p className="text-gray-400">
            {questionSet?.subtitle || `Let's explore your ${currentCategory.pillar.toLowerCase()} aspirations`}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-sm text-gray-400">
          {answeredCount} of {expectedQuestions} questions answered
        </p>
      </div>

      {/* Chat Interface */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <MessageSquare className="w-5 h-5" />
            AI Conversation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chat History for Current Category */}
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {chatHistory
              .filter(msg => msg.pillar === currentCategory.pillar)
              .map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white ml-8'
                      : 'bg-gray-700 text-gray-300 mr-8'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              ))}
          </div>

          {/* Input Area */}
          <div className="space-y-3">
            <Textarea
              placeholder={`Tell me about your ${currentCategory.pillar.toLowerCase()} goals and aspirations...`}
              className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  const target = e.target as HTMLTextAreaElement;
                  if (target.value.trim()) {
                    processWithAI(target.value.trim());
                    target.value = '';
                  }
                }
              }}
            />
            <Button
              onClick={() => {
                const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
                if (textarea?.value.trim()) {
                  processWithAI(textarea.value.trim());
                  textarea.value = '';
                }
              }}
              disabled={isProcessing}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isProcessing ? 'Processing...' : (
                <>
                  Send Message
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Answers Preview */}
      {answeredCount > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Captured Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(currentAnswers).map(([questionId, answer]) => (
                <div key={questionId} className="text-sm">
                  <span className="text-gray-400">{questionId}:</span>
                  <span className="text-gray-300 ml-2">{answer.substring(0, 100)}...</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
