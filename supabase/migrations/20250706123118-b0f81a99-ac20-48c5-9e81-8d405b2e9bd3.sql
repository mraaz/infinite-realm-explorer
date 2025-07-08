-- Create changelog table
CREATE TABLE public.changelog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version TEXT NOT NULL,
  release_date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('added', 'changed', 'deprecated', 'removed', 'fixed', 'security')),
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.changelog ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to published entries
CREATE POLICY "Published changelog entries are viewable by everyone" 
ON public.changelog 
FOR SELECT 
USING (is_published = true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_changelog_updated_at
BEFORE UPDATE ON public.changelog
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample changelog entries
INSERT INTO public.changelog (version, title, content, type, is_published) VALUES
('v1.0.0', 'Initial Release', 'Launch of Infinite Game platform with core features', 'added', true),
('v1.1.0', 'Profile Enhancement', 'Enhanced user profiles with better insights and analytics', 'added', true),
('v1.1.1', 'Bug Fixes', 'Fixed issues with survey completion and data validation', 'fixed', true);