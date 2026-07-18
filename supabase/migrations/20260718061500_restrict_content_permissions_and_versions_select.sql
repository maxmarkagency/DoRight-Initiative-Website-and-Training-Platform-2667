/*
  # Restrict content_permissions and content_versions SELECT access

  The reconstruction migration (20260718060000) mirrored the live database's
  existing RLS policies, which granted anon+authenticated SELECT on
  `content_permissions` and `content_versions`. That matched production
  behavior but is a real information-disclosure exposure: any unauthenticated
  visitor could read who has write/publish/delete access to which pages
  (content_permissions), and the full edit history + author IDs for every
  content block (content_versions). Neither table is read by any current
  frontend code, so tightening this has no functional impact.

  - `content_permissions`: a user can see their own grants; admins see all.
  - `content_versions`: admins only.
*/

DROP POLICY IF EXISTS "Anyone can view content permissions" ON public.content_permissions;
CREATE POLICY "Users see own permissions, admins see all"
  ON public.content_permissions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Anyone can view content versions" ON public.content_versions;
CREATE POLICY "Admins view content versions"
  ON public.content_versions FOR SELECT
  TO authenticated
  USING (public.is_admin());
