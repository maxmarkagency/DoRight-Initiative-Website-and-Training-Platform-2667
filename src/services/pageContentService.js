import supabase from '../lib/supabase';

export const getPageContent = async (pageSlug) => {
  try {
    const { data: page, error: pageError } = await supabase
      .from('pages')
      .select('id')
      .eq('slug', pageSlug)
      .maybeSingle();

    if (pageError) throw pageError;
    if (!page) {
      console.warn(`Page not found: ${pageSlug}`);
      return [];
    }

    const { data: sections, error: sectionsError } = await supabase
      .from('page_sections')
      .select('*')
      .eq('page_id', page.id)
      .eq('is_active', true)
      .order('position', { ascending: true });

    if (sectionsError) throw sectionsError;

    return sections || [];
  } catch (error) {
    console.error(`Error loading page content for ${pageSlug}:`, error);
    return [];
  }
};

export const getSectionByKey = (sections, key) => {
  return sections.find(section => section.section_key === key);
};
