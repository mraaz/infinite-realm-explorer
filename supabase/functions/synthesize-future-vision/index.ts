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
    const { priorities, responses } = await req.json();

    console.log('🎯 Vision Synthesis Request:', {
      priorities,
      responsesCount: Object.keys(responses || {}).length
    });

    // Validate required parameters
    if (!priorities || !responses) {
      console.error('❌ Missing required parameters:', { priorities, responses });
      throw new Error('Missing priorities or responses');
    }

    // Create inspiring transformation prompt
    const systemPrompt = `You are synthesizing a user's questionnaire responses into an inspiring vision of their future transformed personality over the next 5 years.

Focus on:
- Positive personality evolution and growth
- How they'll transform as a person (not just external achievements)
- The confident, capable version of themselves they're becoming
- Character traits they're developing
- How they'll think, feel, and approach life differently

Create inspiring but grounded future self descriptions that show personality transformation.

Use British/Australian English spelling throughout.`;

    const userPrompt = `Based on these responses about someone's 5-year vision, create inspiring personality transformation summaries:

PRIORITIES:
- Main Focus: ${priorities.mainFocus}
- Secondary Focus: ${priorities.secondaryFocus}  
- Maintenance: ${priorities.maintenance?.join(', ')}

RESPONSES:
${Object.entries(responses).map(([pillar, data]: [string, any]) => `
${pillar}:
${data.responses?.join(' ') || 'No responses yet'}
`).join('\n')}

Create a JSON response with this structure:
{
  "${priorities.mainFocus}": "How their personality transforms in this area - focus on character growth, mindset shifts, confidence building",
  "${priorities.secondaryFocus}": "Their personality evolution in this secondary area - new traits they develop",
  ${priorities.maintenance?.map((pillar: string) => `"${pillar}": "How they maintain and evolve in this area - balanced personality traits"`).join(',\n  ')}
}

Each summary should be 2-3 sentences focusing on positive personality transformation, not just external achievements. Show who they're becoming as a person.`;

    console.log('📝 Sending vision synthesis prompt to Claude');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://infinitegame.life',
        'X-Title': 'Infinite Game Vision Synthesis'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenRouter API error:', { status: response.status, error: errorText });
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const aiResponse = await response.json();
    console.log('🤖 Raw AI response received');

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

    let visionData;
    try {
      visionData = JSON.parse(content);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError, 'Content:', content);
      // Fallback with positive personality transformations
      visionData = {
        [priorities.mainFocus]: "You're becoming someone who approaches this area with confidence and clarity, developing the resilience and vision to achieve meaningful progress.",
        [priorities.secondaryFocus]: "Your growth in this area shapes you into a more balanced person, building character traits that support your overall life journey.",
        ...(priorities.maintenance?.reduce((acc: any, pillar: string) => {
          acc[pillar] = "You maintain this area with wisdom and ease, developing sustainable habits that reflect your evolved priorities.";
          return acc;
        }, {}) || {})
      };
    }

    console.log('✅ Final vision data synthesized');

    return new Response(JSON.stringify(visionData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in synthesize-future-vision function:', error);
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