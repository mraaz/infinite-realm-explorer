
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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
    console.log('[share-pulse-results] Function invoked');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get JWT token from Authorization header
    const authorization = req.headers.get('Authorization');
    console.log('[share-pulse-results] Authorization header:', authorization ? 'Present' : 'Missing');

    if (!authorization || !authorization.startsWith('Bearer ')) {
      console.log('[share-pulse-results] Missing or invalid authorization header');
      return new Response(
        JSON.stringify({ error: 'Authentication required', message: 'Please sign in to share your results' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authorization.replace('Bearer ', '');
    console.log('[share-pulse-results] Token extracted, length:', token.length);
    
    // Enhanced JWT payload extraction with better error handling
    let userInfo;
    try {
      // Split JWT and decode payload
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format - expected 3 parts');
      }
      
      // Decode base64url payload with proper padding
      const payload = parts[1];
      const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
      const decodedPayload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));
      userInfo = JSON.parse(decodedPayload);
      
      console.log('[share-pulse-results] JWT decoded successfully:', { 
        sub: userInfo.sub, 
        email: userInfo.email || 'no email',
        exp: userInfo.exp,
        iss: userInfo.iss || 'no issuer'
      });

      // Validate required fields
      if (!userInfo.sub) {
        throw new Error('JWT missing user ID (sub)');
      }
    } catch (error) {
      console.error('[share-pulse-results] JWT decode error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid authentication token', 
          message: 'Please sign in again',
          details: error.message 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if token is expired
    if (userInfo.exp && userInfo.exp * 1000 < Date.now()) {
      console.log('[share-pulse-results] Token is expired');
      return new Response(
        JSON.stringify({ error: 'Token expired', message: 'Please sign in again' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('[share-pulse-results] Request body parsed successfully');
    } catch (error) {
      console.error('[share-pulse-results] JSON parse error:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { resultsData } = requestBody;
    console.log('[share-pulse-results] Results data received:', !!resultsData);
    
    if (!resultsData) {
      return new Response(
        JSON.stringify({ error: 'Results data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = userInfo.sub;
    const userEmail = userInfo.email || 'Unknown User';
    const userName = userInfo.name || userInfo.email?.split('@')[0] || 'Anonymous';

    console.log('[share-pulse-results] User info:', { userId, userEmail, userName });

    // Check daily rate limit
    const today = new Date().toISOString().split('T')[0];
    
    const { data: existingLimit, error: limitError } = await supabase
      .from('user_share_limits')
      .select('share_count')
      .eq('user_id', userId)
      .eq('share_date', today)
      .single();

    if (limitError && limitError.code !== 'PGRST116') {
      console.error('[share-pulse-results] Rate limit check error:', limitError);
      throw limitError;
    }

    const currentShares = existingLimit?.share_count || 0;
    console.log('[share-pulse-results] Current shares today:', currentShares);
    
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
    console.log('[share-pulse-results] Generated share token:', shareToken);

    // Create shared result with enhanced error logging
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
      console.error('[share-pulse-results] Share creation error:', {
        code: shareError.code,
        message: shareError.message,
        details: shareError.details,
        hint: shareError.hint
      });
      throw shareError;
    }

    console.log('[share-pulse-results] Shared result created successfully:', sharedResult.id);

    // Update or create share limit record
    if (existingLimit) {
      const { error: updateError } = await supabase
        .from('user_share_limits')
        .update({ share_count: currentShares + 1, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('share_date', today);
      
      if (updateError) {
        console.error('[share-pulse-results] Share limit update error:', updateError);
      }
    } else {
      const { error: insertError } = await supabase
        .from('user_share_limits')
        .insert({
          user_id: userId,
          share_date: today,
          share_count: 1
        });
      
      if (insertError) {
        console.error('[share-pulse-results] Share limit insert error:', insertError);
      }
    }

    const shareUrl = `${req.headers.get('origin') || 'https://infinitegame.life'}/shared/${shareToken}`;
    console.log('[share-pulse-results] Share URL generated:', shareUrl);

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
    console.error('[share-pulse-results] Unexpected error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: 'Please try again later',
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
