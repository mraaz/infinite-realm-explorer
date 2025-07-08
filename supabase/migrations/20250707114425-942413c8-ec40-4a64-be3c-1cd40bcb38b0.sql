
-- Remove the foreign key constraint that's causing the violation
-- This allows AWS JWT user IDs to be stored without requiring them to exist in auth.users
ALTER TABLE public.shared_pulse_results DROP CONSTRAINT IF EXISTS shared_pulse_results_user_id_fkey;

-- Update the RLS policy to be more permissive for shared results creation
-- since we're removing the foreign key constraint
DROP POLICY IF EXISTS "Users can create shared results" ON public.shared_pulse_results;

CREATE POLICY "Authenticated users can create shared results" 
  ON public.shared_pulse_results 
  FOR INSERT 
  WITH CHECK (user_id IS NOT NULL);

-- Ensure the view policy allows anyone to see non-expired results
DROP POLICY IF EXISTS "Anyone can view shared results" ON public.shared_pulse_results;

CREATE POLICY "Anyone can view shared results" 
  ON public.shared_pulse_results 
  FOR SELECT 
  USING (expires_at > now());

-- Update policy allows both authenticated users and system updates (for view count)
DROP POLICY IF EXISTS "Users can update their shared results" ON public.shared_pulse_results;

CREATE POLICY "System can update shared results" 
  ON public.shared_pulse_results 
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);
