-- Insert default site settings
INSERT INTO settings (key, value, description) VALUES
('site_name', '"DoRight Academy"', 'The name of the LMS site'),
('site_description', '"Learn integrity, leadership, and civic responsibility"', 'Site description for SEO'),
('site_logo', '"/assets/logo.png"', 'URL to the site logo'),
('primary_color', '"#005BBB"', 'Primary brand color'),
('secondary_color', '"#FFC107"', 'Secondary brand color'),
('default_currency', '"NGN"', 'Default currency for courses'),
('allow_registration', 'true', 'Whether new user registration is allowed'),
('require_email_verification', 'true', 'Whether email verification is required'),
('enable_2fa', 'true', 'Whether 2FA is available for users'),
('max_file_upload_size', '104857600', 'Maximum file upload size in bytes (100MB)'),
('allowed_file_types', '["mp4", "avi", "mov", "pdf", "doc", "docx", "ppt", "pptx", "jpg", "jpeg", "png", "gif"]', 'Allowed file types for uploads'),
('email_from_name', '"DoRight Academy"', 'From name for system emails'),
('email_from_address', '"noreply@doright.ng"', 'From address for system emails'),
('certificate_template', '"/templates/certificate.html"', 'Path to certificate template'),
('maintenance_mode', 'false', 'Whether the site is in maintenance mode'),
('google_analytics_id', 'null', 'Google Analytics tracking ID'),
('facebook_pixel_id', 'null', 'Facebook Pixel ID'),
('contact_email', '"info@doright.ng"', 'Contact email for support'),
('contact_phone', '"+234 123 456 7890"', 'Contact phone number'),
('social_facebook', '"https://facebook.com/doright"', 'Facebook page URL'),
('social_twitter', '"https://twitter.com/doright"', 'Twitter profile URL'),
('social_linkedin', '"https://linkedin.com/company/doright"', 'LinkedIn page URL'),
('social_instagram', '"https://instagram.com/doright"', 'Instagram profile URL');

-- Insert default categories
INSERT INTO categories (id, name, slug, description) VALUES
(uuid_generate_v4(), 'Leadership', 'leadership', 'Courses on leadership development and management skills'),
(uuid_generate_v4(), 'Integrity & Ethics', 'integrity-ethics', 'Courses on integrity, ethics, and moral leadership'),
(uuid_generate_v4(), 'Civic Responsibility', 'civic-responsibility', 'Courses on civic engagement and community service'),
(uuid_generate_v4(), 'Anti-Corruption', 'anti-corruption', 'Courses on fighting corruption and promoting transparency'),
(uuid_generate_v4(), 'Youth Development', 'youth-development', 'Courses specifically designed for young leaders'),
(uuid_generate_v4(), 'Community Building', 'community-building', 'Courses on community engagement and development');

-- Create default admin user
INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, is_email_verified) VALUES
(uuid_generate_v4(), 'admin@doright.ng', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj5JKRgwK7/u', 'Admin', 'User', 'admin', true, true);
-- Password: AdminPassword123!

-- Create sample instructor
INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, is_email_verified, bio) VALUES
(uuid_generate_v4(), 'instructor@doright.ng', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj5JKRgwK7/u', 'Dr. Amina', 'Hassan', 'instructor', true, true, 'Former civil servant with 15 years of experience in public administration and governance reform.');
-- Password: InstructorPassword123!

-- Create sample student
INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, is_email_verified) VALUES
(uuid_generate_v4(), 'student@doright.ng', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj5JKRgwK7/u', 'John', 'Doe', 'student', true, true);
-- Password: StudentPassword123!

-- Get the instructor ID for sample courses
DO $$
DECLARE
    instructor_id UUID;
    integrity_cat_id UUID;
    leadership_cat_id UUID;
    course1_id UUID;
    course2_id UUID;
    module1_id UUID;
    module2_id UUID;
    module3_id UUID;
    module4_id UUID;
BEGIN
    -- Get instructor and category IDs
    SELECT id INTO instructor_id FROM users WHERE email = 'instructor@doright.ng';
    SELECT id INTO integrity_cat_id FROM categories WHERE slug = 'integrity-ethics';
    SELECT id INTO leadership_cat_id FROM categories WHERE slug = 'leadership';

    -- Create sample course 1: Foundations of Integrity
    INSERT INTO courses (id, title, slug, description, short_description, instructor_id, status, price, currency, difficulty_level, estimated_duration, language, requirements, learning_objectives, target_audience) 
    VALUES (
        uuid_generate_v4(), 
        'Foundations of Integrity', 
        'foundations-of-integrity',
        'This comprehensive course covers the fundamental principles of integrity, ethics, and personal accountability. Students will learn practical applications of ethical decision-making in personal and professional contexts.',
        'Core values, ethics and personal accountability.',
        instructor_id,
        'published',
        0.00,
        'NGN',
        'beginner',
        180,
        'en',
        ARRAY['Basic literacy', 'Commitment to personal growth'],
        ARRAY['Understand core integrity principles', 'Apply ethical decision-making frameworks', 'Develop personal accountability practices'],
        'Individuals seeking to build strong moral foundations'
    ) RETURNING id INTO course1_id;

    -- Create sample course 2: Leadership & Civic Responsibility
    INSERT INTO courses (id, title, slug, description, short_description, instructor_id, status, price, currency, difficulty_level, estimated_duration, language, requirements, learning_objectives, target_audience) 
    VALUES (
        uuid_generate_v4(), 
        'Leadership & Civic Responsibility', 
        'leadership-civic-responsibility',
        'Advanced course on ethical leadership and community engagement. Learn how to lead with integrity and mobilize communities for positive change.',
        'Leading with integrity; community service.',
        instructor_id,
        'published',
        0.00,
        'NGN',
        'intermediate',
        240,
        'en',
        ARRAY['Completed Foundations of Integrity', 'Basic leadership experience'],
        ARRAY['Develop ethical leadership skills', 'Learn community mobilization techniques', 'Create sustainable change initiatives'],
        'Emerging leaders and community organizers'
    ) RETURNING id INTO course2_id;

    -- Add courses to categories
    INSERT INTO course_categories (course_id, category_id) VALUES 
    (course1_id, integrity_cat_id),
    (course2_id, leadership_cat_id);

    -- Create modules for course 1
    INSERT INTO modules (id, course_id, title, description, position) VALUES
    (uuid_generate_v4(), course1_id, 'Understanding Integrity', 'Introduction to integrity concepts and principles', 1) RETURNING id INTO module1_id;

    INSERT INTO modules (id, course_id, title, description, position) VALUES
    (uuid_generate_v4(), course1_id, 'Practical Applications', 'Real-world applications of integrity in daily life', 2) RETURNING id INTO module2_id;

    -- Create modules for course 2
    INSERT INTO modules (id, course_id, title, description, position) VALUES
    (uuid_generate_v4(), course2_id, 'Leadership Foundations', 'Core principles of ethical leadership', 1) RETURNING id INTO module3_id;

    INSERT INTO modules (id, course_id, title, description, position) VALUES
    (uuid_generate_v4(), course2_id, 'Community Engagement', 'Strategies for community mobilization and engagement', 2) RETURNING id INTO module4_id;

    -- Create lessons for module 1
    INSERT INTO lessons (module_id, title, description, content_type, content, duration_seconds, position, is_preview) VALUES
    (module1_id, 'What Is Integrity?', 'Defining integrity and its importance in personal and professional life', 'video', '{"video_url": "https://example.com/videos/what-is-integrity.mp4", "transcript": "Integrity is..."}', 480, 1, true),
    (module1_id, 'Core Values Exercise', 'Interactive exercise to identify your core values', 'text', '{"html": "<h2>Core Values Exercise</h2><p>In this exercise, you will identify and prioritize your core values...</p>"}', 300, 2, false),
    (module1_id, 'Integrity Self-Assessment', 'Assess your current level of integrity awareness', 'quiz', '{"quiz_id": null, "description": "Test your understanding of integrity concepts"}', 600, 3, false);

    -- Create lessons for module 2
    INSERT INTO lessons (module_id, title, description, content_type, content, duration_seconds, position) VALUES
    (module2_id, 'Everyday Ethics', 'Applying ethical principles in daily decisions', 'video', '{"video_url": "https://example.com/videos/everyday-ethics.mp4", "transcript": "Ethics in daily life..."}', 720, 1),
    (module2_id, 'Case Studies in Integrity', 'Real-world examples of integrity in action', 'text', '{"html": "<h2>Case Studies</h2><p>Explore these real-world scenarios...</p>"}', 900, 2),
    (module2_id, 'Taking Action', 'Creating your personal integrity action plan', 'assignment', '{"instructions": "Create a personal action plan for implementing integrity principles in your life", "max_points": 100}', 1800, 3);

    -- Create lessons for module 3
    INSERT INTO lessons (module_id, title, description, content_type, content, duration_seconds, position) VALUES
    (module3_id, 'Principles of Leadership', 'Fundamental principles of ethical leadership', 'video', '{"video_url": "https://example.com/videos/leadership-principles.mp4", "transcript": "Leadership principles..."}', 900, 1),
    (module3_id, 'Leadership Styles Assessment', 'Discover your natural leadership style', 'quiz', '{"quiz_id": null, "description": "Assessment of leadership styles"}', 450, 2);

    -- Create lessons for module 4
    INSERT INTO lessons (module_id, title, description, content_type, content, duration_seconds, position) VALUES
    (module4_id, 'Mobilizing Communities', 'Strategies for effective community mobilization', 'video', '{"video_url": "https://example.com/videos/community-mobilization.mp4", "transcript": "Community mobilization..."}', 1080, 1),
    (module4_id, 'Community Project Planning', 'Plan and execute a community service project', 'assignment', '{"instructions": "Design a community service project proposal", "max_points": 100}', 2400, 2);

END $$;

-- Create sample webhooks for testing
INSERT INTO webhooks (url, events, secret, is_active, created_by) 
SELECT 'https://example.com/webhook/doright', ARRAY['user.registered', 'course.completed'], 'webhook_secret_123', true, id
FROM users WHERE email = 'admin@doright.ng';

-- Insert sample reviews
DO $$
DECLARE
    student_id UUID;
    course1_id UUID;
    course2_id UUID;
BEGIN
    SELECT id INTO student_id FROM users WHERE email = 'student@doright.ng';
    SELECT id INTO course1_id FROM courses WHERE slug = 'foundations-of-integrity';
    SELECT id INTO course2_id FROM courses WHERE slug = 'leadership-civic-responsibility';

    INSERT INTO reviews (course_id, user_id, rating, review_text, is_approved) VALUES
    (course1_id, student_id, 5, 'Excellent course! Really helped me understand the importance of integrity in leadership.', true);
END $$;