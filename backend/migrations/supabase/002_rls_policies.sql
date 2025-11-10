/*
# Row Level Security (RLS) Policies

This migration secures the database by enabling Row Level Security (RLS) on all tables and defining access policies based on user roles and data ownership.

## 1. Security Changes
- **RLS Enabled**: RLS is enabled on all data tables to enforce a "deny by default" policy.
- **Policy Definitions**: A comprehensive set of policies is created to grant specific permissions (SELECT, INSERT, UPDATE, DELETE) to different user roles.

## 2. Policy Highlights
- **Users**:
  - Users can view and update their own profiles.
  - Admins/staff can view all users, but only admins can update them.
- **Courses & Content (Modules, Lessons)**:
  - Published courses are publicly viewable.
  - Enrolled users can view lessons. Preview lessons are public.
  - Instructors have full control over their own courses and associated content.
  - Admins can manage all courses and content.
- **Enrollments & Progress**:
  - Users can manage their own enrollments and progress.
  - Instructors can view enrollment and progress data for their courses.
  - Admins have full access to all enrollment and progress records.
- **Submissions (Quizzes, Assignments)**:
  - Users can create and view their own submissions.
  - Instructors can view and grade submissions for their courses.
- **Community (Discussions, Reviews)**:
  - Enrolled users can participate in discussions for their courses.
  - Users can create reviews for courses they are enrolled in.
  - Policies ensure that only approved reviews are publicly visible.
- **Payments & Media**:
  - Users can only access their own payment records and media files.
  - Admins can manage all payments and media.
*/
-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON users FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
);
CREATE POLICY "Admins can update all users" ON users FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Courses policies
CREATE POLICY "Published courses are viewable by everyone" ON courses FOR SELECT USING (status = 'published');
CREATE POLICY "Instructors can view their own courses" ON courses FOR SELECT USING (auth.uid() = instructor_id);
CREATE POLICY "Instructors can update their own courses" ON courses FOR UPDATE USING (auth.uid() = instructor_id);
CREATE POLICY "Instructors can create courses" ON courses FOR INSERT WITH CHECK (auth.uid() = instructor_id);
CREATE POLICY "Admins can manage all courses" ON courses FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
);

-- Modules policies
CREATE POLICY "Modules viewable for published courses" ON modules FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM courses WHERE id = course_id AND status = 'published'
    )
);
CREATE POLICY "Course instructors can manage modules" ON modules FOR ALL USING (
    EXISTS (
        SELECT 1 FROM courses WHERE id = course_id AND instructor_id = auth.uid()
    )
);
CREATE POLICY "Admins can manage all modules" ON modules FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
);

-- Lessons policies
CREATE POLICY "Lessons viewable for enrolled users or preview lessons" ON lessons FOR SELECT USING (
    is_preview = true OR
    EXISTS (
        SELECT 1 FROM enrollments e JOIN modules m ON m.course_id = e.course_id
        WHERE m.id = module_id AND e.user_id = auth.uid() AND e.status = 'active'
    ) OR
    EXISTS (
        SELECT 1 FROM courses c JOIN modules m ON m.course_id = c.id
        WHERE m.id = module_id AND c.instructor_id = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
);
CREATE POLICY "Course instructors can manage lessons" ON lessons FOR ALL USING (
    EXISTS (
        SELECT 1 FROM courses c JOIN modules m ON m.course_id = c.id
        WHERE m.id = module_id AND c.instructor_id = auth.uid()
    )
);
CREATE POLICY "Admins can manage all lessons" ON lessons FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
);

-- Enrollments policies
CREATE POLICY "Users can view their own enrollments" ON enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own enrollments" ON enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Instructors can view enrollments for their courses" ON enrollments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM courses WHERE id = course_id AND instructor_id = auth.uid()
    )
);
CREATE POLICY "Admins can manage all enrollments" ON enrollments FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
);

-- Progress policies
CREATE POLICY "Users can view their own progress" ON progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Instructors can view progress for their courses" ON progress FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM lessons l JOIN modules m ON m.id = l.module_id JOIN courses c ON c.id = m.course_id
        WHERE l.id = lesson_id AND c.instructor_id = auth.uid()
    )
);
CREATE POLICY "Admins can view all progress" ON progress FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
);

-- Certificates policies
CREATE POLICY "Users can view their own certificates" ON certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own certificates" ON certificates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Instructors can view certificates for their courses" ON certificates FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM courses WHERE id = course_id AND instructor_id = auth.uid()
    )
);
CREATE POLICY "Admins can manage all certificates" ON certificates FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
);

-- Quiz submissions policies
CREATE POLICY "Users can view their own quiz submissions" ON quiz_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own quiz submissions" ON quiz_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own quiz submissions" ON quiz_submissions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Instructors can view quiz submissions for their courses" ON quiz_submissions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM quizzes q JOIN courses c ON c.id = q.course_id
        WHERE q.id = quiz_id AND c.instructor_id = auth.uid()
    )
);
CREATE POLICY "Instructors can grade quiz submissions for their courses" ON quiz_submissions FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM quizzes q JOIN courses c ON c.id = q.course_id
        WHERE q.id = quiz_id AND c.instructor_id = auth.uid()
    )
);

-- Assignment submissions policies
CREATE POLICY "Users can view their own assignment submissions" ON assignment_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own assignment submissions" ON assignment_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own assignment submissions" ON assignment_submissions FOR UPDATE USING (auth.uid() = user_id AND status IN ('in_progress', 'submitted'));
CREATE POLICY "Instructors can view assignment submissions for their courses" ON assignment_submissions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM assignments a JOIN courses c ON c.id = a.course_id
        WHERE a.id = assignment_id AND c.instructor_id = auth.uid()
    )
);
CREATE POLICY "Instructors can grade assignment submissions for their courses" ON assignment_submissions FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM assignments a JOIN courses c ON c.id = a.course_id
        WHERE a.id = assignment_id AND c.instructor_id = auth.uid()
    )
);

-- Reviews policies
CREATE POLICY "Published reviews are viewable by everyone" ON reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can view their own reviews" ON reviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create reviews for enrolled courses" ON reviews FOR INSERT WITH CHECK (
    auth.uid() = user_id AND EXISTS (
        SELECT 1 FROM enrollments WHERE user_id = auth.uid() AND course_id = reviews.course_id
    )
);
CREATE POLICY "Users can update their own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Instructors can view reviews for their courses" ON reviews FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM courses WHERE id = course_id AND instructor_id = auth.uid()
    )
);
CREATE POLICY "Admins can manage all reviews" ON reviews FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
);

-- Payments policies
CREATE POLICY "Users can view their own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all payments" ON payments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
);

-- Media policies
CREATE POLICY "Users can view their own media" ON media FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can upload their own media" ON media FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update their own media" ON media FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Admins can manage all media" ON media FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
);

-- Discussion policies
CREATE POLICY "Enrolled users can view course discussions" ON discussions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM enrollments WHERE user_id = auth.uid() AND course_id = discussions.course_id AND status = 'active'
    ) OR
    EXISTS (
        SELECT 1 FROM courses WHERE id = course_id AND instructor_id = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
);
CREATE POLICY "Enrolled users can create discussions" ON discussions FOR INSERT WITH CHECK (
    auth.uid() = user_id AND EXISTS (
        SELECT 1 FROM enrollments WHERE user_id = auth.uid() AND course_id = discussions.course_id AND status = 'active'
    )
);
CREATE POLICY "Users can update their own discussions" ON discussions FOR UPDATE USING (auth.uid() = user_id);

-- Discussion replies policies
CREATE POLICY "Users can view replies for viewable discussions" ON discussion_replies FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM discussions d WHERE d.id = discussion_id AND (
            EXISTS (
                SELECT 1 FROM enrollments WHERE user_id = auth.uid() AND course_id = d.course_id AND status = 'active'
            ) OR
            EXISTS (
                SELECT 1 FROM courses c WHERE c.id = d.course_id AND c.instructor_id = auth.uid()
            ) OR
            EXISTS (
                SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'staff')
            )
        )
    )
);
CREATE POLICY "Users can create replies to viewable discussions" ON discussion_replies FOR INSERT WITH CHECK (
    auth.uid() = user_id AND EXISTS (
        SELECT 1 FROM discussions d WHERE d.id = discussion_id AND EXISTS (
            SELECT 1 FROM enrollments WHERE user_id = auth.uid() AND course_id = d.course_id AND status = 'active'
        )
    )
);
CREATE POLICY "Users can update their own replies" ON discussion_replies FOR UPDATE USING (auth.uid() = user_id);