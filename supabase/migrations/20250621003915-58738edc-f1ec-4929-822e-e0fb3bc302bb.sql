
-- Add updated_at column to surveys table
ALTER TABLE public.surveys 
ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update existing records to have updated_at value
UPDATE public.surveys 
SET updated_at = created_at 
WHERE updated_at IS NULL;
