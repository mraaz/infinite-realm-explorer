
-- Create shared_pulse_results table for storing shareable results
CREATE TABLE public.shared_pulse_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  share_token TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users NOT NULL,
  user_display_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  results_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  view_count INTEGER NOT NULL DEFAULT 0
);

-- Create user_share_limits table for rate limiting
CREATE TABLE public.user_share_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  share_date DATE NOT NULL DEFAULT CURRENT_DATE,
  share_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, share_date)
);

-- Add RLS policies for shared_pulse_results
ALTER TABLE public.shared_pulse_results ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view non-expired shared results (public access)
CREATE POLICY "Anyone can view shared results" 
  ON public.shared_pulse_results 
  FOR SELECT 
  USING (expires_at > now());

-- Policy: Authenticated users can create their own shared results
CREATE POLICY "Users can create shared results" 
  ON public.shared_pulse_results 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update view count on their shared results
CREATE POLICY "Users can update their shared results" 
  ON public.shared_pulse_results 
  FOR UPDATE 
  USING (auth.uid() = user_id OR true) -- Allow view count updates from anyone
  WITH CHECK (auth.uid() = user_id OR true);

-- Add RLS policies for user_share_limits
ALTER TABLE public.user_share_limits ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own share limits
CREATE POLICY "Users can manage their share limits" 
  ON public.user_share_limits 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_shared_pulse_results_share_token ON public.shared_pulse_results(share_token);
CREATE INDEX idx_shared_pulse_results_expires_at ON public.shared_pulse_results(expires_at);
CREATE INDEX idx_user_share_limits_user_date ON public.user_share_limits(user_id, share_date);

-- Add trigger for updating updated_at timestamp
CREATE TRIGGER update_user_share_limits_updated_at
  BEFORE UPDATE ON public.user_share_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to cleanup expired shared results (can be called via cron)
CREATE OR REPLACE FUNCTION public.cleanup_expired_shared_results()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.shared_pulse_results 
  WHERE expires_at < now();
END;
$$;
