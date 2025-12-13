/*
  # Seed CMS Content

  1. Seeds
    - Home page sections (Hero, Stats, About, Programs, Training, CTA)
    - About page sections
    - Programs data
    - Site settings (contact info, social links)
*/

-- Seed Home Page Sections
INSERT INTO public.page_sections (page_key, section_key, section_type, title, subtitle, content, content_data, image_url, position, is_visible)
VALUES
  ('home', 'hero', 'hero', 'Building a Nigeria That Does Right', 'Nigeria''s Leading Integrity Initiative', 'Empower. Educate. Transform. Join the movement to promote integrity, accountability, and civic responsibility across communities.', 
   '{"badge": "Nigeria''s Leading Integrity Initiative", "cta_primary": {"text": "Join The Movement", "link": "/join"}, "cta_secondary": {"text": "Start Training", "link": "/training"}, "carousel_images": [{"src": "https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759570847937-Do-right-awarenss-initiative-school-project-6-scaled-2%20%281%29.jpg", "alt": "DRAI educator engaging with students", "title": "Empowering Education"}, {"src": "https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759570856796-Do-right-awarenss-initiative-school-project-6-scaled-2.jpg", "alt": "Students learning about integrity", "title": "Building Future Leaders"}, {"src": "https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759570877162-Capture.PNG", "alt": "Group of students with DRAI materials", "title": "Community Impact"}]}',
   NULL, 1, true),
  
  ('home', 'stats', 'stats', 'Our Growing Impact', 'Real numbers, real change across Nigeria', NULL,
   '{"stats": [{"number": "5,000+", "label": "Citizens Engaged"}, {"number": "50+", "label": "Communities Reached"}, {"number": "100+", "label": "Leaders Trained"}, {"number": "25+", "label": "Policy Changes"}]}',
   NULL, 2, true),
  
  ('home', 'about', 'text', 'Who We Are', 'About DRAI', 'Doing Right Awareness Initiative (DRAI) is a non-profit movement championing integrity, accountability, and civic responsibility across Nigeria. Through public campaigns, comprehensive training programs, and community-led action, we''re building a culture where doing the right thing is the norm, not the exception.',
   '{"secondary_text": "Our approach combines grassroots mobilization with evidence-based advocacy, creating sustainable change from the ground up while engaging with policy makers and institutions at the highest levels."}',
   'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759575546536-DSC_0360-scaled-2-1536x1024.jpg', 3, true),
  
  ('home', 'programs', 'grid', 'Our Programs', NULL, 'Comprehensive initiatives designed to create lasting change through education, advocacy, and community engagement.',
   '{}', NULL, 4, true),
  
  ('home', 'training', 'cta', 'Learn Doing Right — Online Courses & Certification', 'Online Learning', 'Enroll in our comprehensive step-by-step video courses. Complete lessons, pass assessments, earn verified certificates, and unlock advanced training modules in integrity and leadership.',
   '{"cta_primary": {"text": "Browse Courses", "link": "/training"}, "cta_secondary": {"text": "Training Dashboard", "link": "/training/dashboard"}}',
   'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759576809848-image_2025-10-04_041950413.png', 5, true),
  
  ('home', 'cta', 'cta', 'Take Action Today', 'Join the Movement', 'Join thousands of Nigerians committed to building a more transparent, accountable, and integrity-driven society. Every action counts toward creating the Nigeria we all deserve.',
   '{"cta_primary": {"text": "Donate Now", "link": "/join"}, "cta_secondary": {"text": "Volunteer", "link": "/join"}}',
   NULL, 6, true)
ON CONFLICT (page_key, section_key) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  content = EXCLUDED.content,
  content_data = EXCLUDED.content_data,
  image_url = EXCLUDED.image_url,
  updated_at = now();

-- Seed About Page Sections
INSERT INTO public.page_sections (page_key, section_key, section_type, title, subtitle, content, content_data, image_url, position, is_visible)
VALUES
  ('about', 'hero', 'hero', 'About DRAI', 'Our Story', 'We are a movement of Nigerian citizens committed to building a culture of integrity, accountability, and civic responsibility across our nation.',
   '{}', NULL, 1, true),
  
  ('about', 'mission', 'text', 'Our Mission', NULL, 'To promote integrity, accountability, and civic responsibility across Nigeria through education, advocacy, and community-led action, creating sustainable change from the grassroots up.',
   '{"secondary_text": "We believe that lasting transformation comes from empowering citizens with the knowledge, tools, and networks needed to demand and create positive change in their communities."}',
   NULL, 2, true),
  
  ('about', 'vision', 'text', 'Our Vision', NULL, 'A Nigeria where integrity is the norm, where citizens actively participate in governance, and where transparent, accountable leadership drives sustainable development for all.',
   '{"secondary_text": "We envision communities empowered to hold their leaders accountable, institutions that serve the public interest, and a culture where doing right is celebrated and rewarded."}',
   NULL, 3, true),
  
  ('about', 'values', 'grid', 'Our Core Values', NULL, 'These values guide everything we do and shape how we work with communities across Nigeria.',
   '{"values": [{"icon": "FiHeart", "title": "Integrity", "description": "We model the values we promote, operating with transparency and accountability in all our actions."}, {"icon": "FiUsers", "title": "Community-Centered", "description": "Our work is driven by communities, ensuring local ownership and sustainable impact."}, {"icon": "FiTarget", "title": "Results-Oriented", "description": "We measure our success by tangible improvements in governance and civic engagement."}, {"icon": "FiTrendingUp", "title": "Innovation", "description": "We leverage technology and creative approaches to solve complex social challenges."}]}',
   NULL, 4, true),
  
  ('about', 'stats', 'stats', 'Our Impact Since 2018', NULL, 'Measurable results from our commitment to building integrity and accountability across Nigeria.',
   '{"stats": [{"number": "6+", "label": "Years of Impact"}, {"number": "15+", "label": "States Reached"}, {"number": "5000+", "label": "Citizens Trained"}, {"number": "25+", "label": "Policy Reforms"}]}',
   NULL, 5, true),
  
  ('about', 'timeline', 'timeline', 'Our Journey', NULL, 'Key milestones in our mission to promote integrity and accountability across Nigeria.',
   '{"timeline": [{"year": "2018", "title": "Foundation", "description": "Doing Right Awareness Initiative (DRAI) was founded by a group of passionate Nigerian citizens committed to promoting integrity and accountability."}, {"year": "2019", "title": "First Community Programs", "description": "Launched our first youth mentorship programs in Lagos and Abuja, reaching over 500 young leaders."}, {"year": "2020", "title": "Digital Expansion", "description": "Developed our first online training platform and launched digital reporting tools for citizens."}, {"year": "2021", "title": "National Reach", "description": "Expanded operations to 15 states across Nigeria, establishing local chapters and partnerships."}, {"year": "2022", "title": "Policy Impact", "description": "Our advocacy efforts contributed to 12 policy reforms at local and state government levels."}, {"year": "2024", "title": "Comprehensive Platform", "description": "Launched our complete training and certification system, serving over 5,000 active learners."}]}',
   NULL, 6, true),
  
  ('about', 'team', 'team', 'Meet Our Team', NULL, 'The passionate individuals behind DRAI''s mission to promote integrity and accountability across Nigeria.',
   '{}',
   'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759575290797-DSC_0360-scaled-2-1536x1024.jpg', 7, true)
ON CONFLICT (page_key, section_key) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  content = EXCLUDED.content,
  content_data = EXCLUDED.content_data,
  image_url = EXCLUDED.image_url,
  updated_at = now();

-- Seed Programs Page Sections
INSERT INTO public.page_sections (page_key, section_key, section_type, title, subtitle, content, content_data, image_url, position, is_visible)
VALUES
  ('programs', 'hero', 'hero', 'Our Programs', NULL, 'Comprehensive community-led solutions designed to promote integrity, accountability, and civic responsibility across Nigeria through education, advocacy, and grassroots action.',
   '{}', NULL, 1, true),
  
  ('programs', 'impact', 'stats', 'Program Impact', NULL, NULL,
   '{"stats": [{"number": "5,000+", "label": "Citizens Engaged"}, {"number": "50+", "label": "Communities Reached"}, {"number": "100+", "label": "Leaders Trained"}, {"number": "25+", "label": "Policy Changes Influenced"}]}',
   NULL, 2, true),
  
  ('programs', 'how_we_work', 'grid', 'How We Create Change', NULL, 'Our integrated approach combines community mobilization with institutional engagement, creating sustainable change from the grassroots up while influencing policy at the highest levels.',
   '{"items": [{"title": "Community Engagement", "description": "We start at the grassroots level, working directly with communities to identify challenges and build local capacity for change.", "icon": "FiUsers"}, {"title": "Evidence-Based Advocacy", "description": "Our research and data collection inform targeted advocacy efforts that address systemic issues and promote policy reform.", "icon": "FiTarget"}, {"title": "Sustainable Impact", "description": "We measure outcomes and adapt our strategies to ensure lasting change that communities can maintain and expand.", "icon": "FiTrendingUp"}]}',
   NULL, 3, true)
ON CONFLICT (page_key, section_key) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  content = EXCLUDED.content,
  content_data = EXCLUDED.content_data,
  image_url = EXCLUDED.image_url,
  updated_at = now();

-- Seed Programs
INSERT INTO public.programs (title, subtitle, description, icon, image_url, features, position, is_active)
VALUES
  ('Youth Mentorship', 'Leadership for Tomorrow', 'Empowering the next generation of integrity champions through comprehensive mentorship programs, leadership workshops, and peer-led community projects in schools across Nigeria.',
   'FiUsers', 'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759595241762-Do-right-awarenss-initiative-school-project-7-scaled-2-1536x1024.jpg',
   ARRAY['Interactive classroom sessions', 'One-on-one mentorship pairing', 'Student leadership development', 'Character building workshops', 'Peer-to-peer learning networks'],
   1, true),
  
  ('Community Campaigns', 'Local Action for Change', 'Grassroots mobilization initiatives that promote civic awareness, accountability, and community pride through targeted campaigns and local projects.',
   'FiTarget', 'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759595235026-Do-right-awarenss-initiative-school-project-9-scaled-2-1536x1024.jpg',
   ARRAY['Community awareness campaigns', 'Door-to-door civic education', 'Local government engagement sessions', 'Volunteer coordination and training', 'Public accountability forums'],
   2, true),
  
  ('Policy Advocacy', 'Systemic Change Through Research', 'Evidence-based policy research and strategic engagement with stakeholders to create lasting institutional reforms and systemic improvements.',
   'FiTrendingUp', 'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759595248284-Do-right-awarenss-initiative-school-project-13-scaled-2-1536x1024.jpg',
   ARRAY['Policy research and analysis', 'Stakeholder engagement sessions', 'Legislative advocacy', 'Reform implementation monitoring', 'Coalition building with partners'],
   3, true),
  
  ('Educational Outreach', 'Knowledge Sharing & Resource Distribution', 'Comprehensive educational initiatives that provide learning materials, resources, and direct support to schools and communities across Nigeria.',
   'FiShield', 'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759595280475-Do-right-awarenss-initiative-school-project-10-scaled-2-1536x1024.jpg',
   ARRAY['Educational resource distribution', 'School partnership programs', 'Teacher training workshops', 'Student scholarship support', 'Community learning centers'],
   4, true);

-- Seed Site Settings
INSERT INTO public.site_settings (setting_key, setting_value, setting_type, description)
VALUES
  ('site_name', '"Doing Right Awareness Initiative"', 'text', 'The name of the organization'),
  ('site_tagline', '"Building a Nigeria That Does Right"', 'text', 'Site tagline/slogan'),
  ('contact_email', '"info@doright.org"', 'text', 'Primary contact email'),
  ('contact_phone', '"+234 XXX XXX XXXX"', 'text', 'Primary contact phone'),
  ('contact_address', '"Lagos, Nigeria"', 'text', 'Organization address'),
  ('social_links', '{"facebook": "", "twitter": "", "instagram": "", "linkedin": "", "youtube": ""}', 'json', 'Social media links'),
  ('footer_text', '"Empowering citizens for a more accountable Nigeria"', 'text', 'Footer description text')
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  updated_at = now();