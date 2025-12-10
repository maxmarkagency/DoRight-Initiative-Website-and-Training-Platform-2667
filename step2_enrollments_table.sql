-- STEP 2: Create the critical missing enrollments table
-- This script only creates what's still missing

-- Enrollments table (THE CRITICAL MISSING TABLE!)
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'expired')),
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    payment_id UUID,
    UNIQUE(user_id, course_id)
);

-- Progress table
CREATE TABLE IF NOT EXISTS progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    last_position_seconds INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- Enable RLS on new tables (safe to run even if already enabled)
ALTER TABLE IF EXISTS enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS progress ENABLE ROW LEVEL SECURITY;

-- Create policies for enrollments (using IF EXISTS to avoid conflicts)
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own enrollments" ON enrollments;
    DROP POLICY IF EXISTS "Users can create their own enrollments" ON enrollments;
    DROP POLICY IF EXISTS "Users can view their own progress" ON progress;
    DROP POLICY IF EXISTS "Users can update their own progress" ON progress;
    
    -- Create enrollments policies
    CREATE POLICY "Users can view their own enrollments" ON enrollments 
        FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can create their own enrollments" ON enrollments 
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    -- Create progress policies
    CREATE POLICY "Users can view their own progress" ON progress 
        FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can update their own progress" ON progress 
        FOR ALL USING (auth.uid() = user_id);
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_lesson_id ON progress(lesson_id);

SELECT 'SUCCESS: Database setup complete! Enrollments and progress tables are ready.' as status;