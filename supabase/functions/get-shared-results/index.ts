
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url);
    const shareToken = url.searchParams.get('token');

    console.log('[get-shared-results] Request for token:', shareToken);

    if (!shareToken) {
      console.log('[get-shared-results] No share token provided');
      return new Response(
        JSON.stringify({ error: 'Share token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get shared result
    const { data: sharedResult, error: fetchError } = await supabase
      .from('shared_pulse_results')
      .select('*')
      .eq('share_token', shareToken)
      .gt('expires_at', new Date().toISOString())
      .single();

    console.log('[get-shared-results] Database query result:', { 
      found: !!sharedResult, 
      error: fetchError?.code 
    });

    if (fetchError || !sharedResult) {
      console.log('[get-shared-results] Shared result not found or expired:', fetchError);
      return new Response(
        JSON.stringify({ 
          error: 'Shared result not found or expired',
          message: 'This link may have expired or been removed.' 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Increment view count
    const { error: updateError } = await supabase
      .from('shared_pulse_results')
      .update({ 
        view_count: sharedResult.view_count + 1,
        updated_at: new Date().toISOString() 
      })
      .eq('id', sharedResult.id);

    if (updateError) {
      console.error('[get-shared-results] Failed to update view count:', updateError);
    }

    console.log('[get-shared-results] Successfully retrieved shared result:', sharedResult.id);

    // Return the shared result data (without sensitive info)
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          user_display_name: sharedResult.user_display_name,
          results_data: sharedResult.results_data,
          created_at: sharedResult.created_at,
          view_count: sharedResult.view_count + 1
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[get-shared-results] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
