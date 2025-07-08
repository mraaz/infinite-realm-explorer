-- Create table for pulse check swipe results
CREATE TABLE public.pulse_check_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL DEFAULT gen_random_uuid(),
  card_data JSONB NOT NULL, -- Stores the card information
  swipe_decision TEXT NOT NULL CHECK (swipe_decision IN ('keep', 'pass')),
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.pulse_check_results ENABLE ROW LEVEL SECURITY;

-- Create policies for pulse check results
CREATE POLICY "Users can view their own pulse check results" 
ON public.pulse_check_results 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pulse check results" 
ON public.pulse_check_results 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pulse check results" 
ON public.pulse_check_results 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_pulse_check_results_user_session ON public.pulse_check_results(user_id, session_id);
CREATE INDEX idx_pulse_check_results_category ON public.pulse_check_results(category);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_pulse_check_results_updated_at
BEFORE UPDATE ON public.pulse_check_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();