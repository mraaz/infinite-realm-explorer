
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { answers } = await req.json();
    
    if (!answers) {
      throw new Error('Answers are required');
    }

    console.log('Received answers:', answers);

    // Get the OpenRouter API key from Supabase secrets
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    
    if (!openRouterApiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    // Prepare the prompt for analyzing the questionnaire answers
    const systemPrompt = `You are an expert life coach and analyst. Based on the questionnaire answers provided, analyze the user's responses and provide scores for four key life pillars:

1. Career (0-100): Based on career situation, fulfillment, hours worked, and goals
2. Finances (0-100): Based on financial situation, confidence, savings, and goals  
3. Health (0-100): Based on activity levels, sleep, energy, barriers, and goals
4. Connections (0-100): Based on sense of belonging, time spent, relationships, and goals

Return your response as a JSON object with this exact structure:
{
  "career_score": 75,
  "financial_score": 60,
  "health_score": 85,
  "connections_score": 70,
  "insights": [
    {
      "title": "Career Growth Focus",
      "description": "Your career fulfillment score suggests room for growth...",
      "pillar": "career",
      "priority": "high"
    }
  ]
}

Provide 2-4 insights based on the analysis. Each insight should identify patterns or areas for improvement.`;

    const userPrompt = `Please analyze these questionnaire answers and provide scores and insights:

${JSON.stringify(answers, null, 2)}`;

    // Call OpenRouter API using their documentation format
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://infinitegame.life',
        'X-Title': 'Infinite Game Life Analysis'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user', 
            content: userPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', errorText);
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenRouter response:', data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from OpenRouter');
    }

    const aiResponse = data.choices[0].message.content;
    
    // Parse the JSON response from the AI
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      throw new Error('AI returned invalid JSON format');
    }

    // Validate the response structure
    if (!parsedResponse.career_score || !parsedResponse.financial_score || 
        !parsedResponse.health_score || !parsedResponse.connections_score) {
      throw new Error('AI response missing required score fields');
    }

    console.log('Successfully generated scores:', parsedResponse);

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-scores function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Check function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
