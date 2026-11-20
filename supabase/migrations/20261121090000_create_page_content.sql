-- Visual page editor storage: one Puck Data document per page, with draft/published copies
-- and a publish history. Drafts are admin-only; the public reads published content through
-- get_published_page() so the draft column is never exposed.

CREATE TABLE IF NOT EXISTS public.page_content (
  slug text PRIMARY KEY,
  draft jsonb,
  published jsonb,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid,
  published_at timestamptz,
  published_by uuid
);

CREATE TABLE IF NOT EXISTS public.page_content_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL REFERENCES public.page_content(slug) ON DELETE CASCADE,
  data jsonb NOT NULL,
  published_at timestamptz DEFAULT now(),
  published_by uuid
);

CREATE INDEX IF NOT EXISTS page_content_versions_slug_idx
  ON public.page_content_versions (slug, published_at DESC);

ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_content_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage page content" ON public.page_content;
CREATE POLICY "Admins manage page content" ON public.page_content
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins manage page content versions" ON public.page_content_versions;
CREATE POLICY "Admins manage page content versions" ON public.page_content_versions
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.get_published_page(p_slug text)
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT published FROM public.page_content WHERE slug = p_slug;
$$;

CREATE OR REPLACE FUNCTION public.publish_page(p_slug text)
RETURNS timestamptz
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_draft jsonb;
  v_now timestamptz := now();
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT draft INTO v_draft FROM public.page_content WHERE slug = p_slug FOR UPDATE;
  IF v_draft IS NULL THEN
    RAISE EXCEPTION 'nothing to publish';
  END IF;

  UPDATE public.page_content
     SET published = v_draft, published_at = v_now, published_by = auth.uid()
   WHERE slug = p_slug;

  INSERT INTO public.page_content_versions (slug, data, published_at, published_by)
  VALUES (p_slug, v_draft, v_now, auth.uid());

  DELETE FROM public.page_content_versions
   WHERE slug = p_slug
     AND id NOT IN (
       SELECT id FROM public.page_content_versions
        WHERE slug = p_slug
        ORDER BY published_at DESC
        LIMIT 10
     );

  RETURN v_now;
END;
$$;

CREATE OR REPLACE FUNCTION public.restore_page_version(p_version_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_slug text;
  v_data jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT slug, data INTO v_slug, v_data FROM public.page_content_versions WHERE id = p_version_id;
  IF v_slug IS NULL THEN
    RAISE EXCEPTION 'version not found';
  END IF;

  UPDATE public.page_content
     SET draft = v_data, updated_at = now(), updated_by = auth.uid()
   WHERE slug = v_slug;

  RETURN v_data;
END;
$$;

REVOKE ALL ON FUNCTION public.publish_page(text) FROM public;
REVOKE ALL ON FUNCTION public.restore_page_version(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_published_page(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.publish_page(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.restore_page_version(uuid) TO authenticated;
