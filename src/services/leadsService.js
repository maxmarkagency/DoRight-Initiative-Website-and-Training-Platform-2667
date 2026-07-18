import supabase from '../lib/supabase';

export const getActiveSubCommittees = async () => {
  try {
    const { data, error } = await supabase
      .from('sub_committees')
      .select('id, name')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error loading sub-committees:', error);
    return [];
  }
};

// Same query as getActiveSubCommittees plus `description` — used by the public
// sub-committee responsibilities page, which needs the prose the dropdown doesn't.
export const getSubCommitteeDetails = async () => {
  try {
    const { data, error } = await supabase
      .from('sub_committees')
      .select('id, name, description')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error loading sub-committee details:', error);
    return [];
  }
};

const buildAdminNotes = (interest, message) => {
  const lines = [];
  if (interest) lines.push(`Interest: ${interest}`);
  if (message) lines.push(`Message: ${message}`);
  return lines.length > 0 ? lines.join('\n') : null;
};

export const submitLead = async ({ fullName, email, phone, interest, message, subCommitteeId, photoFile }) => {
  const fileExt = photoFile.name.split('.').pop();
  const filePath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('lead-photos')
    .upload(filePath, photoFile, { cacheControl: '3600', upsert: false });

  if (uploadError) throw uploadError;

  const { error: insertError } = await supabase
    .from('leads')
    .insert({
      full_name: fullName,
      email,
      phone,
      photo_url: filePath,
      sub_committee_id: subCommitteeId,
      source: 'website',
      admin_notes: buildAdminNotes(interest, message)
    });

  if (insertError) throw insertError;
};
