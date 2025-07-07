import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { decode } from "https://deno.land/x/djwt@v2.8/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    )

    // Get JWT token from Authorization header
    const authorization = req.headers.get('Authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authorization.replace('Bearer ', '');
    
    // Decode JWT token to get user info
    let userInfo;
    try {
      const [header, payload, signature] = decode(token);
      userInfo = payload as any;
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid JWT token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if token is expired
    if (userInfo.exp && userInfo.exp * 1000 < Date.now()) {
      return new Response(
        JSON.stringify({ error: 'Token expired' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { resultsData } = await req.json();
    
    if (!resultsData) {
      return new Response(
        JSON.stringify({ error: 'Results data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = userInfo.sub;
    const userEmail = userInfo.email || 'Unknown';
    const userName = userInfo.name || userEmail.split('@')[0];

    // Check daily rate limit
    const today = new Date().toISOString().split('T')[0];
    
    const { data: existingLimit, error: limitError } = await supabase
      .from('user_share_limits')
      .select('share_count')
      .eq('user_id', userId)
      .eq('share_date', today)
      .single();

    if (limitError && limitError.code !== 'PGRST116') {
      throw limitError;
    }

    const currentShares = existingLimit?.share_count || 0;
    
    if (currentShares >= 25) {
      return new Response(
        JSON.stringify({ 
          error: 'Daily share limit reached',
          message: 'You can share up to 25 results per day. Try again tomorrow!' 
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique share token
    const shareToken = crypto.randomUUID();

    // Create shared result
    const { data: sharedResult, error: shareError } = await supabase
      .from('shared_pulse_results')
      .insert({
        user_id: userId,
        user_email: userEmail,
        user_display_name: userName,
        share_token: shareToken,
        results_data: resultsData
      })
      .select()
      .single();

    if (shareError) {
      throw shareError;
    }

    // Update or create share limit record
    if (existingLimit) {
      await supabase
        .from('user_share_limits')
        .update({ share_count: currentShares + 1, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('share_date', today);
    } else {
      await supabase
        .from('user_share_limits')
        .insert({
          user_id: userId,
          share_date: today,
          share_count: 1
        });
    }

    const shareUrl = `${req.headers.get('origin') || 'https://infinitegame.life'}/shared/${shareToken}`;

    return new Response(
      JSON.stringify({ 
        success: true, 
        shareUrl,
        sharesRemaining: 24 - currentShares
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error sharing results:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});