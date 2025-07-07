
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the user from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Invalid user token');
    }

    const { results_data, user_display_name, user_email } = await req.json();

    // Check rate limiting
    const today = new Date().toISOString().split('T')[0];
    const { data: shareLimits, error: limitError } = await supabase
      .from('user_share_limits')
      .select('share_count')
      .eq('user_id', user.id)
      .eq('share_date', today)
      .single();

    if (limitError && limitError.code !== 'PGRST116') {
      throw limitError;
    }

    if (shareLimits && shareLimits.share_count >= 25) {
      return new Response(
        JSON.stringify({ error: 'Daily share limit exceeded (25 shares per day)' }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate unique share token
    const shareToken = crypto.randomUUID().replace(/-/g, '').substring(0, 16);

    // Create shared result
    const { data: sharedResult, error: createError } = await supabase
      .from('shared_pulse_results')
      .insert({
        share_token: shareToken,
        user_id: user.id,
        user_display_name,
        user_email,
        results_data
      })
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    // Update or create share limit record
    const { error: limitUpdateError } = await supabase
      .from('user_share_limits')
      .upsert({
        user_id: user.id,
        share_date: today,
        share_count: (shareLimits?.share_count || 0) + 1,
        updated_at: new Date().toISOString()
      });

    if (limitUpdateError) {
      console.error('Error updating share limits:', limitUpdateError);
      // Don't throw here as the main operation succeeded
    }

    return new Response(
      JSON.stringify({ share_token: shareToken, id: sharedResult.id }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error creating shared result:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
