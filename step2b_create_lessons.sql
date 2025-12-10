-- STEP 2B: Create the lessons table
-- This will ensure PostgREST can see the table

-- Create lessons table if it doesn't exist
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    content_type TEXT CHECK (content_type IN ('video', 'text', 'pdf', 'quiz', 'assignment', 'external_link')),
    content JSONB,
    duration_seconds INTEGER,
    position INTEGER DEFAULT 0,
    is_preview BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on lessons table
ALTER TABLE IF EXISTS lessons ENABLE ROW LEVEL SECURITY;

-- Create simple policy for lessons
CREATE POLICY IF NOT EXISTS "Published lessons are viewable" ON lessons 
    FOR SELECT USING (true);

SELECT 'Step 2B complete: Lessons table created and configured' as status;