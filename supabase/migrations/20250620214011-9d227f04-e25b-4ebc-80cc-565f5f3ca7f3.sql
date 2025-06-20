
-- Add missing foreign key constraints (only if they don't exist)
DO $$ 
BEGIN
    -- Add surveys foreign key if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'surveys_user_id_fkey' 
        AND table_name = 'surveys'
    ) THEN
        ALTER TABLE public.surveys 
        ADD CONSTRAINT surveys_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;

    -- Add habits foreign key if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'habits_user_id_fkey' 
        AND table_name = 'habits'
    ) THEN
        ALTER TABLE public.habits 
        ADD CONSTRAINT habits_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;

    -- Add checkins foreign key if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'checkins_habit_id_fkey' 
        AND table_name = 'checkins'
    ) THEN
        ALTER TABLE public.checkins 
        ADD CONSTRAINT checkins_habit_id_fkey 
        FOREIGN KEY (habit_id) REFERENCES public.habits(id) ON DELETE CASCADE;
    END IF;

    -- Add profiles foreign key if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_survey_id_fkey' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_survey_id_fkey 
        FOREIGN KEY (survey_id) REFERENCES public.surveys(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add comprehensive RLS policies for users table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' AND policyname = 'Users can view their own profile'
    ) THEN
        CREATE POLICY "Users can view their own profile" ON public.users
          FOR SELECT USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' AND policyname = 'Users can update their own profile'
    ) THEN
        CREATE POLICY "Users can update their own profile" ON public.users
          FOR UPDATE USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' AND policyname = 'Public profiles are viewable by anyone'
    ) THEN
        CREATE POLICY "Public profiles are viewable by anyone" ON public.users
          FOR SELECT USING (is_public = true);
    END IF;
END $$;

-- Add RLS policies for surveys table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'surveys' AND policyname = 'Users can manage their own surveys'
    ) THEN
        CREATE POLICY "Users can manage their own surveys" ON public.surveys
          FOR ALL USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'surveys' AND policyname = 'Public surveys are viewable by anyone'
    ) THEN
        CREATE POLICY "Public surveys are viewable by anyone" ON public.surveys
          FOR SELECT USING (is_public = true);
    END IF;
END $$;

-- Add RLS policies for profiles table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Users can view profiles of their surveys'
    ) THEN
        CREATE POLICY "Users can view profiles of their surveys" ON public.profiles
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.surveys 
              WHERE surveys.id = profiles.survey_id 
              AND surveys.user_id = auth.uid()
            )
          );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Users can create profiles for their surveys'
    ) THEN
        CREATE POLICY "Users can create profiles for their surveys" ON public.profiles
          FOR INSERT WITH CHECK (
            EXISTS (
              SELECT 1 FROM public.surveys 
              WHERE surveys.id = profiles.survey_id 
              AND surveys.user_id = auth.uid()
            )
          );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Users can update profiles of their surveys'
    ) THEN
        CREATE POLICY "Users can update profiles of their surveys" ON public.profiles
          FOR UPDATE USING (
            EXISTS (
              SELECT 1 FROM public.surveys 
              WHERE surveys.id = profiles.survey_id 
              AND surveys.user_id = auth.uid()
            )
          );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Public profiles are viewable by anyone'
    ) THEN
        CREATE POLICY "Public profiles are viewable by anyone" ON public.profiles
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.surveys 
              WHERE surveys.id = profiles.survey_id 
              AND surveys.is_public = true
            )
          );
    END IF;
END $$;

-- Add RLS policies for habits table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'habits' AND policyname = 'Users can manage their own habits'
    ) THEN
        CREATE POLICY "Users can manage their own habits" ON public.habits
          FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- Add RLS policies for checkins table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'checkins' AND policyname = 'Users can manage checkins for their habits'
    ) THEN
        CREATE POLICY "Users can manage checkins for their habits" ON public.checkins
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM public.habits 
              WHERE habits.id = checkins.habit_id 
              AND habits.user_id = auth.uid()
            )
          );
    END IF;
END $$;

-- Add validation constraints (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'surveys_status_check' 
        AND table_name = 'surveys'
    ) THEN
        ALTER TABLE public.surveys 
        ADD CONSTRAINT surveys_status_check 
        CHECK (status IN ('in_progress', 'completed'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'habits_status_check' 
        AND table_name = 'habits'
    ) THEN
        ALTER TABLE public.habits 
        ADD CONSTRAINT habits_status_check 
        CHECK (status IN ('active', 'established', 'paused'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'habits_pillar_check' 
        AND table_name = 'habits'
    ) THEN
        ALTER TABLE public.habits 
        ADD CONSTRAINT habits_pillar_check 
        CHECK (pillar IN ('Career', 'Health', 'Financials', 'Connections'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'checkins_result_check' 
        AND table_name = 'checkins'
    ) THEN
        ALTER TABLE public.checkins 
        ADD CONSTRAINT checkins_result_check 
        CHECK (result IN ('gold', 'silver', 'none'));
    END IF;
END $$;

-- Add indexes for better performance and security
CREATE INDEX IF NOT EXISTS idx_surveys_user_id_status ON public.surveys(user_id, status);
CREATE INDEX IF NOT EXISTS idx_habits_user_id_status ON public.habits(user_id, status);
CREATE INDEX IF NOT EXISTS idx_profiles_survey_id ON public.profiles(survey_id);
