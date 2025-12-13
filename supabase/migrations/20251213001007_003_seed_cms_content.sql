/*
  # Seed CMS Content with Existing Website Data

  This migration populates the CMS tables with existing website content extracted from the React components.

  1. Site Settings
    - Organization name, contact information, social media links

  2. Team Members
    - Trustees with profiles, bios, and images

  3. Programs
    - Youth Mentorship, Community Campaigns, Policy Advocacy, Educational Outreach

  4. Events
    - Annual Leadership Summit, Youth Integrity Workshop

  5. Content Sections
    - Home page sections (hero, stats, about, programs)
    - About page sections (mission, vision, values, timeline)
    - Programs page sections
    - Contact page sections
*/

-- ============= SITE SETTINGS =============

INSERT INTO site_settings (setting_key, setting_value, setting_type, category, description) VALUES
('site_name', 'Doing Right Awareness Initiative', 'text', 'general', 'Organization name'),
('site_tagline', 'Building a Nigeria That Does Right', 'text', 'general', 'Main tagline'),
('contact_email', 'info@doright.ng', 'email', 'contact', 'Main contact email'),
('contact_phone', '+234 XXX XXX XXXX', 'text', 'contact', 'Main contact phone'),
('contact_address', '28b, Olaminuyun street, Parkview, Lagos, Nigeria 101233', 'text', 'contact', 'Physical address'),
('facebook_url', '#', 'url', 'social', 'Facebook page URL'),
('twitter_url', '#', 'url', 'social', 'Twitter profile URL'),
('instagram_url', '#', 'url', 'social', 'Instagram profile URL'),
('linkedin_url', '#', 'url', 'social', 'LinkedIn page URL')
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  updated_at = now();

-- ============= TEAM MEMBERS (TRUSTEES) =============

INSERT INTO team_members (name, role, category, bio_short, bio_full, image_url, position_order, is_featured, is_active) VALUES
(
  'Pastor Wale Adefarasin',
  'General Overseer, Guiding Light Assembly',
  'trustee',
  'Pastor Wale Adefarasin is the General Overseer of Guiding Light Assembly, he is presenter of ''The Heart of the matter'', a television programme that deals with social issues.',
  'He is married to Pastor Olaolu Adefarasin and they have 3 children and 2 grandchildren. He is a firm believer in the sanctity of ''family'', and the importance of family in our national life. He believes that it is in the family that the character of our future leaders is forged. Pastor Wale Adefarasin has great hope in the future of Nigeria, and is passionate that there is a future and a hope for Nigeria, once its citizens arise to work for it.',
  'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759593162037-wale-adefarasin-1.jpg',
  1, true, true
),
(
  'Ayodele Alamutu',
  'Founder, RollTheDice Global Resources',
  'trustee',
  'She is the founder of RollTheDice Global Resources, involved in Internal Control, Audit, Business Advisory and Risk Management Advisory Services. She is a Risk Management, Assurance and Control Executive with more than 25 years progressive experience in the UK and Nigeria.',
  'Ms. Alamutu is a fellow of the Institute of Chartered Accountants of Nigeria, A Certified member of The Institute of Risk Management (CIRM) and currently the Vice Chair of IRM Nigeria Regional Group. She is an Information Systems Auditor, Project Management Professional and a Board member of the Institute of Internal Auditors. She has been mentoring youths for over 30years and is rewarded by living to witness the strides these youths have and are achieving today. This has geared her to continue her involvement with the youth and join them to help promote the tenets of Doing Right nationally. In her spare time, she loves to read and Zumba dance. Her risk management philosophy is to challenge management to consider extreme events and asymmetric risks that could impact their objectives and test them against their current activities.',
  'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759593178510-alamutu-1.jpg',
  2, true, true
),
(
  'Ekeinde Ohiwerei',
  'Leader, Nigeria LNG Limited',
  'trustee',
  'Ekeinde Ohiwerei has broad technical, commercial and leadership skills acquired in his career at Nigeria LNG Limited. His technical roles have been in maintenance, engineering and projects.',
  'He has led key corporate activities and initiatives over the years. These include handling all contracting and procurement activities across and driving Nigerian Content. He currently leads the launched the company''s digital transformation and energy transition agendas along with responsibilities for projects and engineering. Ekeinde is a member of the Nigerian Society of Engineers and Council for the Regulation of Engineering in Nigeria (COREN), as well as a member of the Chartered Institute of Procurement and Supply.',
  'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759593181701-ekehinde-1.jpg',
  3, true, true
),
(
  'Tunde Oduwole',
  'Financial Director, Multinational Energy Company',
  'trustee',
  'Tunde Oduwole is a passionate believer in Nigeria and the promise the country holds. He is currently the Financial Director at a multinational energy company in Nigeria.',
  'He has nearly three decades of rich experience across commercial finance, corporate strategy, business development, audit and accounting across oil and gas industry, financial and management consulting in Africa, Europe and North America. He has served on Boards of multinational energy companies in Nigeria and West Africa and has led multi-billion dollars corporate and project finance transactions that unlocked immense economic opportunities for Nigeria in the upstream and midstream energy sectors. A Fellow of the Institute of Chartered Accountants of Nigeria, as well as an International Associate of the American Institute of Certified Public Accountants. He holds a Master of Science degree in Banking and Finance from Boston University, Massachusetts USA. An adventurous traveller, who enjoys painting, playing saxophone and producing stage plays. Among other plays, in 2017 he produced the critically acclaimed play "Gula" based on a written account of former President Olusegun Obasanjo''s experience with a young underworld kingpin while a political prisoner.',
  'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759593188790-oduwole-1.jpg',
  4, true, true
),
(
  'Ajibike Badeji',
  'Business Development Consultant',
  'trustee',
  'Ajibike Badeji has over 20 years combined experience in business, management and technology consulting. She is an accredited SMEDAN Business Development Service Provider (BDSP), a certified Scrum Master and a certified Learning and Performance Institute (LPI) Trainer.',
  'She is passionate about Nigeria, entrepreneurs and the economic development of women and hence loves to coach and mentor entrepreneurs and young women. In addition to being an International Finance Corporation (IFC) Trainer, she brings extensive expertise in business development and technology consulting to help drive positive change in communities across Nigeria.',
  'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759593192104-mrs-badeji-1.jpg',
  5, true, true
),
(
  'Adeniyi Aromolaran',
  'Executive Director, LSDPC',
  'trustee',
  'Adeniyi Aromolaran, MCIoD, FCIPM, FITD, HRPL, fondly referred to as "AA"- The Transformer'', is a Certified Sustainable Development Solutions & Modelling Consultant, an International Finance Corporation/Learning and Performance Institute (LPI) Certified Trainer.',
  'He is an Expert-In-Residence at the Enterprise Development Centre, (EDC), Lagos Business School, (LBS) Pan African University, Lagos Nigeria. At various times he served on the Council of the Nigeria-Britain Association as the Honorary Deputy Financial Secretary, Honorary Financial Secretary, Honorary Treasurer and Honorary Secretary. He was a one-time Global President of Government College Lagos Old Boys Association, GCLOBA). He is presently the Executive Director, Enterprises Services Directorate at the Lagos State Development and Property Corporation, LSDPC. He is the Co-Convener/Co-Founder, Rethinking Nigeria Business Leadership Network. The network promotes the "Rethinking Business Conduct and Practices- a Sustainable Concept to Transforming Nigeria''s Business Eco-System mind-set.',
  'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759593586025-niyi-1.png',
  6, true, true
)
ON CONFLICT (id) DO NOTHING;

-- ============= PROGRAMS =============

INSERT INTO programs_cms (title, subtitle, slug, description, short_description, features, image_url, icon_name, color_scheme, position_order, is_active) VALUES
(
  'Youth Mentorship',
  'Leadership for Tomorrow',
  'youth-mentorship',
  'Empowering the next generation of integrity champions through comprehensive mentorship programs, leadership workshops, and peer-led community projects in schools across Nigeria.',
  'Empowering young leaders through mentorship and workshops for tomorrow''s integrity champions.',
  '["Interactive classroom sessions", "One-on-one mentorship pairing", "Student leadership development", "Character building workshops", "Peer-to-peer learning networks"]'::jsonb,
  'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759595241762-Do-right-awarenss-initiative-school-project-7-scaled-2-1536x1024.jpg',
  'FiUsers',
  'from-primary to-primary-600',
  1, true
),
(
  'Community Campaigns',
  'Local Action for Change',
  'community-campaigns',
  'Grassroots mobilization initiatives that promote civic awareness, accountability, and community pride through targeted campaigns and local projects.',
  'Local projects promoting accountability, transparency, and civic pride in communities.',
  '["Community awareness campaigns", "Door-to-door civic education", "Local government engagement sessions", "Volunteer coordination and training", "Public accountability forums"]'::jsonb,
  'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759595235026-Do-right-awarenss-initiative-school-project-9-scaled-2-1536x1024.jpg',
  'FiTarget',
  'from-primary to-primary-600',
  2, true
),
(
  'Policy Advocacy',
  'Systemic Change Through Research',
  'policy-advocacy',
  'Evidence-based policy research and strategic engagement with stakeholders to create lasting institutional reforms and systemic improvements.',
  'Research-driven engagement with stakeholders to create systemic change and reform.',
  '["Policy research and analysis", "Stakeholder engagement sessions", "Legislative advocacy", "Reform implementation monitoring", "Coalition building with partners"]'::jsonb,
  'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759595248284-Do-right-awarenss-initiative-school-project-13-scaled-2-1536x1024.jpg',
  'FiTrendingUp',
  'from-primary to-primary-600',
  3, true
),
(
  'Educational Outreach',
  'Knowledge Sharing & Resource Distribution',
  'educational-outreach',
  'Comprehensive educational initiatives that provide learning materials, resources, and direct support to schools and communities across Nigeria.',
  'Tools and platforms for citizens to report issues and ensure proper follow-up.',
  '["Educational resource distribution", "School partnership programs", "Teacher training workshops", "Student scholarship support", "Community learning centers"]'::jsonb,
  'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759595280475-Do-right-awarenss-initiative-school-project-10-scaled-2-1536x1024.jpg',
  'FiShield',
  'from-primary to-primary-600',
  4, true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  short_description = EXCLUDED.short_description,
  features = EXCLUDED.features,
  image_url = EXCLUDED.image_url,
  updated_at = now();

-- ============= EVENTS =============

INSERT INTO events_calendar (title, description, event_date, location, location_address, event_type, is_featured, is_published) VALUES
(
  'Annual Leadership Summit 2024',
  'A gathering of leaders to discuss the future of ethical governance and civic engagement in Africa.',
  '2024-10-26 09:00:00+00',
  'Lagos, Nigeria',
  'Lagos, Nigeria',
  'summit',
  true, true
),
(
  'Youth Integrity Workshop',
  'An interactive workshop for young leaders on the importance of integrity and anti-corruption.',
  '2024-11-15 10:00:00+00',
  'Online Webinar',
  'Online',
  'workshop',
  true, true
)
ON CONFLICT (id) DO NOTHING;

-- ============= HOME PAGE CONTENT SECTIONS =============

INSERT INTO content_sections (page_name, section_key, section_type, position, content_data, is_visible) VALUES
(
  'home',
  'hero',
  'hero',
  1,
  '{
    "badge": {"icon": "FiStar", "text": "Nigeria''s Leading Integrity Initiative"},
    "title": "Building a Nigeria That Does Right",
    "subtitle": "Empower. Educate. Transform.",
    "description": "Join the movement to promote integrity, accountability, and civic responsibility across communities.",
    "cta_primary": {"text": "Join The Movement", "url": "/join"},
    "cta_secondary": {"text": "Start Training", "url": "/training"},
    "trust_indicators": [
      {"icon": "FiUsers", "text": "5,000+ Active Members"},
      {"icon": "FiAward", "text": "Certified Training Programs"}
    ],
    "carousel_images": [
      {
        "src": "https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759570847937-Do-right-awarenss-initiative-school-project-6-scaled-2%20%281%29.jpg",
        "alt": "DRAI educator engaging with students in classroom",
        "title": "Empowering Education"
      },
      {
        "src": "https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759570856796-Do-right-awarenss-initiative-school-project-6-scaled-2.jpg",
        "alt": "Students learning about integrity",
        "title": "Building Future Leaders"
      },
      {
        "src": "https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759570877162-Capture.PNG",
        "alt": "Group of students with DRAI materials",
        "title": "Community Impact"
      }
    ]
  }'::jsonb,
  true
),
(
  'home',
  'stats',
  'statistics',
  2,
  '{
    "title": "Our Growing Impact",
    "subtitle": "Real numbers, real change across Nigeria",
    "stats": [
      {"number": "5,000+", "label": "Citizens Engaged"},
      {"number": "50+", "label": "Communities Reached"},
      {"number": "100+", "label": "Leaders Trained"},
      {"number": "25+", "label": "Policy Changes"}
    ]
  }'::jsonb,
  true
)
ON CONFLICT (page_name, section_key) DO UPDATE SET
  content_data = EXCLUDED.content_data,
  updated_at = now();