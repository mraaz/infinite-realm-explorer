
-- Create users table with public profile support
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  public_slug TEXT UNIQUE,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create surveys table
CREATE TABLE public.surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  answers JSONB,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  is_public BOOLEAN DEFAULT FALSE
);

-- Create profiles table for survey results
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE,
  scores JSONB, -- includes career, finances, health, connections, and overall
  insights JSONB, -- AI-generated patterns (e.g., 'Burnout Risk')
  actions JSONB, -- curated suggestions (e.g., 'Set Boundaries', 'Energy Audit')
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create habits table
CREATE TABLE public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  pillar TEXT NOT NULL, -- Career, Health, Financials, Connections
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'established', 'paused')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create checkins table for habit tracking
CREATE TABLE public.checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE,
  week DATE NOT NULL,
  result TEXT CHECK (result IN ('gold', 'silver', 'none')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by anyone" ON public.users
  FOR SELECT USING (is_public = true);

-- RLS Policies for surveys table
CREATE POLICY "Users can manage their own surveys" ON public.surveys
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public surveys are viewable by anyone" ON public.surveys
  FOR SELECT USING (is_public = true);

-- RLS Policies for profiles table
CREATE POLICY "Users can view profiles of their surveys" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.surveys 
      WHERE surveys.id = profiles.survey_id 
      AND surveys.user_id = auth.uid()
    )
  );

CREATE POLICY "Public profiles are viewable by anyone" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.surveys 
      WHERE surveys.id = profiles.survey_id 
      AND surveys.is_public = true
    )
  );

-- RLS Policies for habits table
CREATE POLICY "Users can manage their own habits" ON public.habits
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for checkins table
CREATE POLICY "Users can manage checkins for their habits" ON public.checkins
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.habits 
      WHERE habits.id = checkins.habit_id 
      AND habits.user_id = auth.uid()
    )
  );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  slug_base TEXT;
  slug_candidate TEXT;
  counter INTEGER := 0;
BEGIN
  -- Generate base slug from email
  slug_base := LOWER(SPLIT_PART(NEW.email, '@', 1));
  slug_base := REGEXP_REPLACE(slug_base, '[^a-z0-9]', '', 'g');
  
  -- Ensure minimum length
  IF LENGTH(slug_base) < 3 THEN
    slug_base := slug_base || 'user';
  END IF;
  
  slug_candidate := slug_base;
  
  -- Find unique slug
  WHILE EXISTS (SELECT 1 FROM public.users WHERE public_slug = slug_candidate) LOOP
    counter := counter + 1;
    slug_candidate := slug_base || counter::TEXT;
  END LOOP;
  
  -- Insert user record
  INSERT INTO public.users (id, email, public_slug)
  VALUES (NEW.id, NEW.email, slug_candidate);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_users_public_slug ON public.users(public_slug);
CREATE INDEX idx_surveys_user_id ON public.surveys(user_id);
CREATE INDEX idx_profiles_survey_id ON public.profiles(survey_id);
CREATE INDEX idx_habits_user_id ON public.habits(user_id);
CREATE INDEX idx_checkins_habit_id ON public.checkins(habit_id);
CREATE INDEX idx_checkins_week ON public.checkins(week);
