import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PulseCheckResult {
  id: string;
  user_id: string;
  session_id: string;
  card_data: {
    id: number;
    category: string;
    text: string;
  };
  swipe_decision: 'keep' | 'pass';
  category: string;
  created_at: string;
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { sessionId, userId } = await req.json();

    if (!sessionId || !userId) {
      throw new Error('Session ID and User ID are required');
    }

    console.log('Processing pulse check results for session:', sessionId);

    // Fetch all pulse check results for this session
    const { data: results, error } = await supabase
      .from('pulse_check_results')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching pulse check results:', error);
      throw error;
    }

    if (!results || results.length === 0) {
      throw new Error('No pulse check results found for this session');
    }

    console.log('Found', results.length, 'pulse check results');

    // Calculate scores for each category
    const categoryScores: CategoryScores = {
      Career: 0,
      Finances: 0,
      Health: 0,
      Connections: 0
    };

    const categoryCounts = {
      Career: { kept: 0, total: 0 },
      Finances: { kept: 0, total: 0 },
      Health: { kept: 0, total: 0 },
      Connections: { kept: 0, total: 0 }
    };

    // Process each result
    results.forEach((result: PulseCheckResult) => {
      const category = result.category as keyof CategoryScores;
      categoryCounts[category].total++;
      
      if (result.swipe_decision === 'keep') {
        categoryCounts[category].kept++;
      }
    });

    // Calculate percentage scores for each category
    Object.keys(categoryCounts).forEach(category => {
      const cat = category as keyof CategoryScores;
      const { kept, total } = categoryCounts[cat];
      categoryScores[cat] = total > 0 ? Math.round((kept / total) * 100) : 0;
    });

    console.log('Calculated category scores:', categoryScores);

    // Generate insights based on scores
    const insights = generateInsights(categoryScores, results);

    const response = {
      sessionId,
      scores: categoryScores,
      insights,
      totalCards: results.length,
      timestamp: new Date().toISOString()
    };

    console.log('Returning pulse check analysis:', response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-scores function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateInsights(scores: CategoryScores, results: PulseCheckResult[]) {
  const insights: string[] = [];
  
  // Find highest and lowest scoring categories
  const sortedCategories = Object.entries(scores).sort(([,a], [,b]) => b - a);
  const highestCategory = sortedCategories[0];
  const lowestCategory = sortedCategories[sortedCategories.length - 1];
  
  // Generate insights based on patterns
  if (highestCategory[1] >= 75) {
    insights.push(`You show strong alignment in ${highestCategory[0]} with ${highestCategory[1]}% resonance.`);
  }
  
  if (lowestCategory[1] <= 25) {
    insights.push(`${lowestCategory[0]} might need more attention in your life planning.`);
  }
  
  // Check for balance
  const scoreValues = Object.values(scores);
  const average = scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length;
  const variance = scoreValues.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / scoreValues.length;
  
  if (variance < 200) { // Low variance means balanced
    insights.push("You show a balanced approach across all life areas.");
  } else {
    insights.push("There's room to create more balance between different life areas.");
  }
  
  // Add specific insights based on kept cards
  const keptCards = results.filter(r => r.swipe_decision === 'keep');
  if (keptCards.length >= 8) {
    insights.push("You're open to growth and new perspectives across multiple areas.");
  }
  
  return insights;
}