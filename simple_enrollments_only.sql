-- SIMPLE APPROACH: Create ONLY the enrollments table with minimal dependencies
-- This avoids foreign key constraints that might be causing issues

-- Create a simple enrollments table that doesn't depend on courses/lessons
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    course_id UUID NOT NULL,
    status TEXT DEFAULT 'active',
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    UNIQUE(user_id, course_id)
);

-- Enable RLS
ALTER TABLE IF EXISTS enrollments ENABLE ROW LEVEL SECURITY;

-- Create simple policy
CREATE POLICY IF NOT EXISTS "Users can view their own enrollments" ON enrollments 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create their own enrollments" ON enrollments 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add an index for performance
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);

-- Success message
SELECT 'SUCCESS: Enrollments table created with minimal dependencies' as result;