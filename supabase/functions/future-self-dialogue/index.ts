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
      systemPrompt = `You are creating a dialogue between someone's Inner Doubt (worried, skeptical, fearful) and their Future Self (confident, inspiring, progressively futuristic, taking firm control) about their MAIN FOCUS area: ${pillar}. This is their primary area for growth and achievement over the next 5 years.`;
      
      if (questionNumber === 1) {
        questionContext = "Start by exploring their big vision and what success looks like in this area. Future Self should ask about their ultimate 5-year vision.";
      } else if (questionNumber === 2) {
        questionContext = "Dive deeper into specific goals and what they want to achieve. Future Self should be more commanding and futuristic.";
      } else {
        questionContext = "Focus on the practical steps and commitment needed to make this vision reality. Future Self should be powerfully directive.";
      }
    } else if (focusType === 'secondary') {
      systemPrompt = `You are creating a dialogue between someone's Inner Doubt and their Future Self about their SECONDARY FOCUS area: ${pillar}. Future Self should be increasingly confident and futuristic.`;
      
      if (questionNumber === 1) {
        questionContext = "Explore how this area supports their main focus and overall life balance. Future Self asks big-picture questions.";
      } else if (questionNumber === 2) {
        questionContext = "Discuss specific improvements they want to see in this area. Future Self should be more assertive and visionary.";
      } else {
        questionContext = "Address how they'll maintain progress here while focusing primarily elsewhere.";
      }
    } else { // maintenance
      systemPrompt = `You are creating a dialogue between someone's Inner Doubt and their Future Self about maintaining their ${pillar} area. Future Self should be wise and powerfully assured.`;
      questionContext = "Focus on what 'good enough' looks like and how to maintain stability in this area without it becoming a problem. Future Self should ask with confident authority.";
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
1. Inner Doubt raises a realistic concern or fear about that area FIRST
2. Future Self responds with an inspiring, firm, progressively futuristic question that takes control and asks about their 5-year vision

The Inner Doubt should express worried concerns but not be completely negative - more like a worried friend.
The Future Self should be increasingly inspiring, confident, and futuristic with each question, asking big-picture 5-year vision questions that help them think beyond current limitations. Future Self should sound progressively more commanding and visionary.

Use British/Australian English spelling and expressions throughout (e.g., "realise" not "realize", "colour" not "color", "organised" not "organized").

Keep both messages concise (2-3 sentences each) and make them feel like a natural conversation. The Future Self's question should help them think deeply about what they really want in this area.

Return ONLY a JSON object with this exact format:
{
  "doubtMessage": "Inner Doubt's concerned thoughts here",
  "heroMessage": "Future Self's inspiring, firm, futuristic question that takes control here"
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
        doubtMessage: `But what if you're not capable of achieving what you want in ${pillar}? What if you're setting yourself up for disappointment?`,
        heroMessage: `Look beyond your current limitations - in 5 years, what does mastery in your ${pillar} area actually look like? Paint me the vision that excites you most.`
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