-- Focused migration to create ONLY missing tables
-- This script handles existing database elements gracefully

-- Create missing tables only (using IF NOT EXISTS)
-- Note: Types already exist, so we skip type creation

-- Enrollments table (THE CRITICAL MISSING TABLE)
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

-- Progress table (often missing)
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

-- Categories table (for course organization)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course category relationships
CREATE TABLE IF NOT EXISTS course_categories (
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, category_id)
);

-- Enable RLS on new tables
ALTER TABLE IF EXISTS enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS course_categories ENABLE ROW LEVEL SECURITY;

-- Create essential RLS policies for enrollments
DO $$ 
BEGIN
    -- Drop existing policies if they exist to avoid conflicts
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_lesson_id ON progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_progress_completed ON progress(completed);

-- Success message
SELECT 'Database migration completed successfully! Enrollments table and related tables are now available.' as status;