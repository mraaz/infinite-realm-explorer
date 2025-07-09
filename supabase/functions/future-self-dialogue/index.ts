
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      pillar, 
      questionNumber, 
      totalQuestions, 
      focusType, 
      previousAnswers = {},
      isFirstQuestion = false 
    } = await req.json();

    console.log('🎯 Future Self Dialogue Request:', {
      pillar,
      questionNumber,
      totalQuestions,
      focusType,
      isFirstQuestion,
      previousAnswersCount: Object.keys(previousAnswers).length
    });

    // Validate required parameters
    if (!pillar || !questionNumber || !totalQuestions || !focusType) {
      console.error('❌ Missing required parameters:', { pillar, questionNumber, totalQuestions, focusType });
      throw new Error('Missing required parameters');
    }

    // Create context-aware prompts based on focus type and question progression
    let systemPrompt = "";
    let questionContext = "";

    if (focusType === 'main') {
      systemPrompt = `You are creating a dialogue between someone's Future Self (confident, inspiring, visionary) and their Inner Doubt (worried, skeptical, fearful) about their MAIN FOCUS area: ${pillar}. This is their primary area for growth and achievement over the next 5 years.`;
      
      if (questionNumber === 1) {
        questionContext = "Start by exploring their big vision and what success looks like in this area.";
      } else if (questionNumber === 2) {
        questionContext = "Dive deeper into specific goals and what they want to achieve.";
      } else {
        questionContext = "Focus on the practical steps and commitment needed to make this vision reality.";
      }
    } else if (focusType === 'secondary') {
      systemPrompt = `You are creating a dialogue between someone's Future Self and their Inner Doubt about their SECONDARY FOCUS area: ${pillar}. This is important but not their main priority.`;
      
      if (questionNumber === 1) {
        questionContext = "Explore how this area supports their main focus and overall life balance.";
      } else if (questionNumber === 2) {
        questionContext = "Discuss specific improvements they want to see in this area.";
      } else {
        questionContext = "Address how they'll maintain progress here while focusing primarily elsewhere.";
      }
    } else { // maintenance
      systemPrompt = `You are creating a dialogue between someone's Future Self and their Inner Doubt about maintaining their ${pillar} area. This is about keeping things stable and healthy, not major growth.`;
      questionContext = "Focus on what 'good enough' looks like and how to maintain stability in this area without it becoming a problem.";
    }

    // Add previous answers context if available
    let previousContext = "";
    if (Object.keys(previousAnswers).length > 0) {
      previousContext = `\n\nPrevious answers in this category: ${JSON.stringify(previousAnswers)}`;
    }

    const prompt = `${systemPrompt}

Question ${questionNumber} of ${totalQuestions} for ${pillar} (${focusType} focus).
${questionContext}
${previousContext}

Create a dialogue where:
1. Future Self asks an insightful, specific question about their vision for ${pillar}
2. Inner Doubt raises a realistic concern or fear about that area

The Future Self should be inspiring but practical. The Inner Doubt should be concerned but not completely negative - more like a worried friend.

Keep both messages concise (2-3 sentences each) and make them feel like a natural conversation. The question should help them think deeply about what they really want in this area.

Return ONLY a JSON object with this exact format:
{
  "heroMessage": "Future Self's inspiring question here",
  "doubtMessage": "Inner Doubt's concerned response here"
}`;

    console.log('📝 Sending prompt to Claude:', {
      promptLength: prompt.length,
      pillar,
      questionNumber,
      focusType
    });

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://infinitegame.life',
        'X-Title': 'Infinite Game Future Self Dialogue'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          { 
            role: 'user', 
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenRouter API error:', { status: response.status, error: errorText });
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const aiResponse = await response.json();
    console.log('🤖 Raw AI response:', aiResponse);

    if (!aiResponse.choices?.[0]?.message?.content) {
      console.error('❌ Invalid AI response structure:', aiResponse);
      throw new Error('Invalid response from AI');
    }

    let content = aiResponse.choices[0].message.content.trim();
    
    // Clean up the content to ensure it's valid JSON
    if (content.startsWith('```json')) {
      content = content.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/```\n?/, '').replace(/\n?```$/, '');
    }

    let dialogueData;
    try {
      dialogueData = JSON.parse(content);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError, 'Content:', content);
      // Fallback with context-appropriate defaults
      dialogueData = {
        heroMessage: `What does success in your ${pillar} area look like 5 years from now? Paint me a picture of your ideal scenario.`,
        doubtMessage: `But what if you're not capable of achieving that? What if you're setting yourself up for disappointment?`
      };
    }

    console.log('✅ Final dialogue data:', dialogueData);

    if (!dialogueData.heroMessage || !dialogueData.doubtMessage) {
      console.error('❌ Missing required message fields:', dialogueData);
      throw new Error('AI response missing required message fields');
    }

    return new Response(JSON.stringify(dialogueData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in future-self-dialogue function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check function logs for more information'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
