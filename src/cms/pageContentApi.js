import supabase from '../lib/supabase';

const ROW_COLUMNS = 'slug, draft, published, updated_at, published_at';

const unwrap = ({ data, error }) => {
  if (error) throw error;
  return data;
};

export const fetchPublished = async (slug) =>
  unwrap(await supabase.rpc('get_published_page', { p_slug: slug }));

export const fetchPageRow = async (slug) =>
  unwrap(await supabase.from('page_content').select(ROW_COLUMNS).eq('slug', slug).maybeSingle());

export const listPageRows = async () =>
  unwrap(await supabase.from('page_content').select(ROW_COLUMNS));

export const saveDraft = async (slug, data) => {
  const { data: auth } = await supabase.auth.getUser();
  unwrap(
    await supabase.from('page_content').upsert(
      { slug, draft: data, updated_at: new Date().toISOString(), updated_by: auth?.user?.id ?? null },
      { onConflict: 'slug' }
    )
  );
};

export const publishPage = async (slug) => unwrap(await supabase.rpc('publish_page', { p_slug: slug }));

export const listVersions = async (slug) =>
  unwrap(
    await supabase
      .from('page_content_versions')
      .select('id, published_at')
      .eq('slug', slug)
      .order('published_at', { ascending: false })
  );

export const restoreVersion = async (versionId) =>
  unwrap(await supabase.rpc('restore_page_version', { p_version_id: versionId }));
