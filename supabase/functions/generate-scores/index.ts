import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PulseCheckResult {
  cardId: number;
  decision: 'keep' | 'pass';
  card_data: {
    category: string;
    tone: 'positive' | 'negative';
    text: string;
  };
}

interface CategoryScores {
  Career: number;
  Finances: number;
  Health: number;
  Connections: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { results } = await req.json() as { results: PulseCheckResult[] };
    
    if (!results || !Array.isArray(results)) {
      throw new Error('Invalid results data provided');
    }

    console.log('Processing pulse check results:', results.length, 'results');

    // Prepare data for AI analysis
    const categoryData = {
      Career: { kept: [], passed: [] },
      Finances: { kept: [], passed: [] },
      Health: { kept: [], passed: [] },
      Connections: { kept: [], passed: [] }
    };

    // Organize results by category and decision
    results.forEach(result => {
      const category = result.card_data.category as keyof typeof categoryData;
      if (categoryData[category]) {
        if (result.decision === 'keep') {
          categoryData[category].kept.push({
            text: result.card_data.text,
            tone: result.card_data.tone
          });
        } else {
          categoryData[category].passed.push({
            text: result.card_data.text,
            tone: result.card_data.tone
          });
        }
      }
    });

    const prompt = `
You are an expert life coach analyzing pulse check results. Based on the user's responses to various life statements, provide a numerical score (0-100) for each of the four life categories.

Here's what the user kept vs passed for each category:

**Career:**
Kept: ${JSON.stringify(categoryData.Career.kept)}
Passed: ${JSON.stringify(categoryData.Career.passed)}

**Finances:**
Kept: ${JSON.stringify(categoryData.Finances.kept)}
Passed: ${JSON.stringify(categoryData.Finances.passed)}

**Health:**
Kept: ${JSON.stringify(categoryData.Health.kept)}
Passed: ${JSON.stringify(categoryData.Health.passed)}

**Connections:**
Kept: ${JSON.stringify(categoryData.Connections.kept)}
Passed: ${JSON.stringify(categoryData.Connections.passed)}

Scoring Guidelines:
- 0-30: Significant challenges, needs immediate attention
- 31-60: Some progress but room for improvement
- 61-80: Good foundation with areas to optimize
- 81-100: Thriving and well-balanced

Consider:
- Positive statements kept = higher scores
- Negative statements kept = areas of concern
- Balance of kept vs passed items
- Tone and content of statements

Respond with ONLY a JSON object in this exact format:
{
  "Career": 75,
  "Finances": 68,
  "Health": 82,
  "Connections": 71,
  "insights": {
    "Career": "Brief insight about career based on responses",
    "Finances": "Brief insight about finances based on responses", 
    "Health": "Brief insight about health based on responses",
    "Connections": "Brief insight about connections based on responses"
  }
}
`;

    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    console.log('Calling OpenRouter API...');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://infinitegame.life',
        'X-Title': 'Infinite Game Life Pulse Check'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenRouter response received');

    const aiResponse = data.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    // Parse the JSON response
    let scores: CategoryScores & { insights: Record<string, string> };
    try {
      scores = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      // Fallback scoring based on simple heuristics
      const fallbackScores = {
        Career: Math.min(100, Math.max(0, (categoryData.Career.kept.length / Math.max(1, categoryData.Career.kept.length + categoryData.Career.passed.length)) * 100)),
        Finances: Math.min(100, Math.max(0, (categoryData.Finances.kept.length / Math.max(1, categoryData.Finances.kept.length + categoryData.Finances.passed.length)) * 100)),
        Health: Math.min(100, Math.max(0, (categoryData.Health.kept.length / Math.max(1, categoryData.Health.kept.length + categoryData.Health.passed.length)) * 100)),
        Connections: Math.min(100, Math.max(0, (categoryData.Connections.kept.length / Math.max(1, categoryData.Connections.kept.length + categoryData.Connections.passed.length)) * 100)),
        insights: {
          Career: "Based on your responses, we've calculated your career wellness score.",
          Finances: "Your financial wellness score reflects your current relationship with money.",
          Health: "Your health score represents your current physical and mental wellbeing focus.",
          Connections: "Your connection score shows how you're managing relationships and social needs."
        }
      };
      scores = fallbackScores;
    }

    console.log('Generated scores:', scores);

    return new Response(JSON.stringify(scores), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-scores function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      // Provide fallback scores in case of error
      Career: 50,
      Finances: 50,
      Health: 50,
      Connections: 50,
      insights: {
        Career: "Unable to analyze at this time. Please try again.",
        Finances: "Unable to analyze at this time. Please try again.",
        Health: "Unable to analyze at this time. Please try again.",
        Connections: "Unable to analyze at this time. Please try again."
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});