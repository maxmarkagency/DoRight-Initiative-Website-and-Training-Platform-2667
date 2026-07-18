import supabase from '../lib/supabase';

export const getPageContent = async (pageKey) => {
  try {
    const { data: sections, error } = await supabase
      .from('page_sections')
      .select('*')
      .eq('page_key', pageKey)
      .eq('is_visible', true)
      .order('position', { ascending: true });

    if (error) throw error;

    return sections || [];
  } catch (error) {
    console.error(`Error loading page content for ${pageKey}:`, error);
    return [];
  }
};

export const getSectionByKey = (sections, key) => {
  return sections.find(section => section.section_key === key);
};
