import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Hero-Villain dialogue prompts
const dialoguePrompts = {
  "Career": [
    {
      "hero_prompt": "Imagine it's five years from now… what does your *dream career* look like? What's different, what's exciting? *Try closing your eyes for 10 seconds to picture it first.*",
      "villain_reply": "Dream careers are cute… but what if things just stay the same? Isn't it safer not to change?",
      "hero_closing": "I hear the fear—but you wouldn't be dreaming this if it didn't matter. *Write down one small step you could take this week to start moving toward it.*"
    },
    {
      "hero_prompt": "Let's break it down: what are the *three biggest milestones* you'd love to hit in your career over the next five years? *First three things that pop up—no perfection needed.*",
      "villain_reply": "Milestones? Sounds like a fast track to disappointment…",
      "hero_closing": "Every bold move starts with a small spark. *Capture those milestones somewhere—naming them is the first win.*"
    },
    {
      "hero_prompt": "Why does this matter to you? What's the *real* reason you want this change? *Your 'why' will fuel your follow-through.*",
      "villain_reply": "Are you sure you even care that much? Or is this just… something to do?",
      "hero_closing": "The fact that you paused to answer this tells me you care. *Remind yourself of your 'why' whenever things get tough.*"
    }
  ],
  "Financials": [
    {
      "hero_prompt": "Five years ahead—what's your *ideal financial situation*? Paint me the lifestyle or feeling, not just the bank balance. *What would financial ease feel like for you?*",
      "villain_reply": "Money plans? We both know life gets in the way…",
      "hero_closing": "Even small steps create momentum. *Define what 'enough' feels like—clarity fuels action.*"
    },
    {
      "hero_prompt": "What are the *three biggest financial outcomes* you'd love to achieve by then? *Could be freedom from debt, a safety net, or a dream purchase.*",
      "villain_reply": "Three? How about just hoping to survive next month first…",
      "hero_closing": "Aiming higher doesn't mean ignoring reality—it means shaping it. *Write these down, even if they feel far away.*"
    },
    {
      "hero_prompt": "Why do these money goals matter to you? What would change in your life if you made them real? *Think beyond dollars—what's the feeling?*",
      "villain_reply": "Does it really matter? Money stress never really goes away anyway…",
      "hero_closing": "Financial peace is possible—one decision at a time. *Focus on the freedom, not the fear.*"
    }
  ],
  "Health": [
    {
      "hero_prompt": "In five years, how do you want to *feel* in your body, mind, and energy? *Not about perfection—what's 'healthy enough' for your happiest self?*",
      "villain_reply": "Honestly… isn't 'fine' good enough? No need to overdo it.",
      "hero_closing": "You deserve to feel good in your skin. *Pick one tiny habit you can start today.*"
    },
    {
      "hero_prompt": "What are *three small but meaningful outcomes* you'd like for your health by then? *Could be sleeping better, moving more, or less stress.*",
      "villain_reply": "Goals? That sounds like a lot of spinach and jogging…",
      "hero_closing": "It doesn't have to be hard to matter. *One tiny shift leads to the next.*"
    },
    {
      "hero_prompt": "Why does your health matter to you in the long run? What will it allow you to do, feel, or experience more of? *Your 'why' will make the how easier.*",
      "villain_reply": "Maybe it doesn't matter that much… just coast along, right?",
      "hero_closing": "The stronger you feel, the fuller you live. *Hold onto that vision.*"
    }
  ],
  "Connections": [
    {
      "hero_prompt": "Five years from now—what do you want your *relationships and connections* to look and feel like? *Think close friends, family, your community vibe.*",
      "villain_reply": "Relationships? People come and go… is it really worth the trouble?",
      "hero_closing": "It's always worth it. *Name one person you'd love to stay connected to—and reach out this week.*"
    },
    {
      "hero_prompt": "What are *three key outcomes* you'd love to see in your social or personal life by then? *Deeper friendships? New circles? Stronger bonds?*",
      "villain_reply": "Key outcomes? Or maybe you'll just end up more isolated?",
      "hero_closing": "Your connections shape your joy. *List them out—one step closer to making them real.*"
    },
    {
      "hero_prompt": "Why do these relationships matter to you? What would having them give you in your life? *Connection is fuel too—what does it mean to you?*",
      "villain_reply": "Why bother? It's safer to keep your distance sometimes…",
      "hero_closing": "Real connection nourishes the soul. *Reach out before you need to—small gestures matter most.*"
    }
  ]
};

interface FutureSelfRequest {
  user_id: string;
  category: string;
  sequence: number;
  user_response: string;
  existing_json?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, category, sequence, user_response, existing_json }: FutureSelfRequest = await req.json();

    console.log('Future Self Dialogue Request:', { user_id, category, sequence, user_response });

    // Validate inputs
    if (!category || !dialoguePrompts[category]) {
      throw new Error('Invalid category provided');
    }

    if (sequence < 0 || sequence >= dialoguePrompts[category].length) {
      throw new Error('Invalid sequence number for category');
    }

    const questionData = dialoguePrompts[category][sequence];
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');

    if (!openRouterApiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    // Generate Villain response with strict character limits
    const villainPrompt = `You are the "Inner Doubt" voice. Be extremely brief and gentle. MAXIMUM 15 words.

User answered: "${user_response}"

Respond with subtle doubt based on: "${questionData.villain_reply}"

RULES:
- Maximum 15 words total
- Gentle, not harsh
- One sentence only
- No questions, just soft doubt`;

    const villainResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          { role: 'system', content: villainPrompt },
          { role: 'user', content: user_response }
        ],
        max_tokens: 50,
        temperature: 0.5,
      }),
    });

    if (!villainResponse.ok) {
      throw new Error(`OpenRouter villain API error: ${await villainResponse.text()}`);
    }

    const villainData = await villainResponse.json();
    const villainMessage = villainData.choices[0].message.content;

    // Generate Hero response with strict character limits
    const heroPrompt = `You are the "Hero" voice - future successful self. Be inspiring but brief. MAXIMUM 20 words.

User answered: "${user_response}"
Doubt said: "${villainMessage}"

Respond based on: "${questionData.hero_closing}"

RULES:
- Maximum 20 words total
- Include one *italicized action* word
- Encouraging and actionable
- One sentence only`;

    const heroResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          { role: 'system', content: heroPrompt },
          { role: 'user', content: user_response }
        ],
        max_tokens: 60,
        temperature: 0.5,
      }),
    });

    if (!heroResponse.ok) {
      throw new Error(`OpenRouter hero API error: ${await heroResponse.text()}`);
    }

    const heroData = await heroResponse.json();
    const heroMessage = heroData.choices[0].message.content;

    // Fix answer format to match confirmation step expectations
    const updatedJson = { ...existing_json };
    if (!updatedJson[category]) {
      updatedJson[category] = {};
    }
    
    // Store answer with proper question ID format for confirmation step
    const questionId = `q${sequence + 1}`;
    updatedJson[category][questionId] = user_response;

    console.log('Generated responses:', { 
      villain: villainMessage, 
      hero: heroMessage, 
      updated_json: updatedJson 
    });

    return new Response(JSON.stringify({
      villain: villainMessage,
      hero: heroMessage,
      updated_json: updatedJson
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in future-self-dialogue function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      villain: "I'm having trouble connecting right now...",
      hero: "Don't worry, we can continue this conversation. *Take a moment to reflect on your thoughts while we reconnect.*"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});