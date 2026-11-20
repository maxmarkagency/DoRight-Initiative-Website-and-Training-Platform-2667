-- Replace the About page "values" section content with the seven DRAI core values.
-- The About page prefers this DB content over its hardcoded fallback, so the code-only
-- change in About.jsx did not show on the live site.
UPDATE public.page_sections ps
SET content_data = jsonb_set(
      coalesce(ps.content_data, '{}'::jsonb),
      '{values}',
      '[
        {"icon": "FiCheckCircle", "title": "Integrity", "description": "Being honest, telling the truth and consistently upholding strong moral values and ethical standards."},
        {"icon": "FiTrendingUp", "title": "Diligence", "description": "Working steadily and earnestly, and persevering until the goal is achieved."},
        {"icon": "FiUsers", "title": "Respect", "description": "Showing due regard for the feelings, wishes and rights of others."},
        {"icon": "FiHeart", "title": "Compassion", "description": "Recognising when others are in distress or suffering and taking action to help them."},
        {"icon": "FiShield", "title": "Justice", "description": "Acting fairly and upholding what is morally right, both in how we treat people and in the causes we support."},
        {"icon": "FiZap", "title": "Courage", "description": "Choosing to face pain, danger, uncertainty or intimidation in pursuit of a worthy goal."},
        {"icon": "FiAward", "title": "Meritocracy", "description": "Building a society that values excellence, selects the most competent people for leadership and holds them accountable to the highest standards."}
      ]'::jsonb
    ),
    updated_at = now()
FROM public.pages p
WHERE ps.page_id = p.id
  AND p.slug = 'about'
  AND ps.section_key = 'values';
