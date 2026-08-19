import supabase from '../lib/supabase';

export const TIERS = {
  tier_1: {
    key: 'tier_1',
    label: 'Tier 1',
    name: 'Tier 1 (Personal Advocate)',
    description: 'Lead by personal example within your daily routine and share monthly impact stories.',
    focus: 'Lead by personal example within your daily routine.',
    action: 'Share at least 1 personal impact story per month.',
    progression: '12 months of consistent tracking unlocks advancement to Tier 2.',
    badgeClass: 'bg-blue-100 text-blue-800 border border-blue-200',
    color: '#005BBB',
  },
  tier_2: {
    key: 'tier_2',
    label: 'Tier 2',
    name: 'Tier 2 (Movement Champion)',
    description: 'Public outreach, social media campaigns, and community events.',
    focus: 'Public outreach, social media campaigns, and community events.',
    action: 'Share 2 monthly campaign posts & attend 1 quarterly community event.',
    progression: '12 months of proven impact unlocks advancement to Tier 3.',
    badgeClass: 'bg-purple-100 text-purple-800 border border-purple-200',
    color: '#6B46C1',
  },
  tier_3: {
    key: 'tier_3',
    label: 'Tier 3',
    name: 'Tier 3 (Strategic Leader)',
    description: 'Driving organizational strategy and operations across specialized sub-committees.',
    focus: 'Driving organizational strategy and operations across specialized sub-committees.',
    action: 'Maintain 70% committee meeting attendance and deliver assigned monthly tasks in your sub-committees.',
    progression: 'Core leadership driving nationwide transformation.',
    badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    color: '#047857',
  }
};

export const TIER_KEYS = ['tier_1', 'tier_2', 'tier_3'];

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

export const submitLead = async ({ fullName, email, phone, interest, message, subCommitteeId = null, photoFile }) => {
  const fileExt = photoFile.name.split('.').pop();
  const filePath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('lead-photos')
    .upload(filePath, photoFile, { cacheControl: '3600', upsert: false });

  if (uploadError) throw uploadError;

  const now = new Date().toISOString();
  const fallbackMembershipId = `DRAI-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const { data: insertedData, error: insertError } = await supabase
    .from('leads')
    .insert({
      full_name: fullName,
      email,
      phone,
      photo_url: filePath,
      sub_committee_id: subCommitteeId || null,
      source: 'website',
      tier: 'tier_1',
      tier_1_at: now,
      membership_id: fallbackMembershipId,
      status: 'new',
      admin_notes: buildAdminNotes(interest, message)
    })
    .select()
    .single();

  if (insertError) {
    // If column trigger exists or duplicate, try insert without fallback
    const { data: retryData, error: retryError } = await supabase
      .from('leads')
      .insert({
        full_name: fullName,
        email,
        phone,
        photo_url: filePath,
        sub_committee_id: subCommitteeId || null,
        source: 'website',
        tier: 'tier_1',
        tier_1_at: now,
        status: 'new',
        admin_notes: buildAdminNotes(interest, message)
      })
      .select()
      .single();

    if (retryError) throw retryError;
    return retryData;
  }

  return insertedData;
};

export const DEFAULT_TIER_WHATSAPP_LINKS = {
  tier_1: 'https://chat.whatsapp.com/DoRightTier1Advocates',
  tier_2: 'https://chat.whatsapp.com/DoRightTier2Champions',
  tier_3: 'https://chat.whatsapp.com/DoRightTier3Leaders'
};

export const getTierWhatsAppLinks = async () => {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'tier_whatsapp_links')
      .maybeSingle();

    if (error) throw error;
    return {
      ...DEFAULT_TIER_WHATSAPP_LINKS,
      ...(data?.setting_value || {})
    };
  } catch (err) {
    console.error('Error fetching tier WhatsApp links:', err);
    return DEFAULT_TIER_WHATSAPP_LINKS;
  }
};

export const saveTierWhatsAppLinks = async (links) => {
  const merged = {
    ...DEFAULT_TIER_WHATSAPP_LINKS,
    ...links
  };

  const { error } = await supabase
    .from('site_settings')
    .upsert({
      setting_key: 'tier_whatsapp_links',
      setting_value: merged,
      setting_type: 'json',
      description: 'WhatsApp community group links for each member tier',
      updated_at: new Date().toISOString()
    }, { onConflict: 'setting_key' });

  if (error) throw error;
  return merged;
};

/**
 * Sends a tier promotion/transition notification email to a member.
 */
export const sendTierNotificationEmail = async ({ lead, toTier, fromTier = null, customNotes = null }) => {
  try {
    const whatsappLinks = await getTierWhatsAppLinks();
    const whatsappGroupUrl = whatsappLinks[toTier] || whatsappLinks.tier_1;

    const { data, error } = await supabase.functions.invoke('send-lead-welcome-email', {
      body: {
        action: 'TIER_TRANSITION',
        toTier,
        fromTier,
        customNotes,
        whatsappGroupUrl,
        lead: {
          id: lead.id,
          membership_id: lead.membership_id,
          full_name: lead.full_name,
          email: lead.email,
          tier: toTier
        }
      }
    });

    if (error) {
      console.warn('Tier notification email invocation returned error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Error dispatching tier notification email:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Updates a member's tier and optionally dispatches an automated notification email.
 */
export const updateLeadTier = async ({
  lead,
  newTier,
  adminNotes = '',
  sendEmail = true,
  customEmailNotes = ''
}) => {
  if (!lead || !newTier) throw new Error('Lead and newTier are required');

  const now = new Date().toISOString();
  const updates = {
    tier: newTier,
    admin_notes: adminNotes.trim() ? adminNotes.trim() : null
  };

  // Stamp tier milestone timestamps
  if (newTier === 'tier_1' && !lead.tier_1_at) {
    updates.tier_1_at = now;
  } else if (newTier === 'tier_2' && !lead.tier_2_at) {
    updates.tier_2_at = now;
  } else if (newTier === 'tier_3' && !lead.tier_3_at) {
    updates.tier_3_at = now;
  }

  const { error: dbError } = await supabase
    .from('leads')
    .update(updates)
    .eq('id', lead.id);

  if (dbError) throw dbError;

  let emailResult = null;
  if (sendEmail && lead.email) {
    emailResult = await sendTierNotificationEmail({
      lead,
      toTier: newTier,
      fromTier: lead.tier || 'tier_1',
      customNotes: customEmailNotes
    });
  }

  return { success: true, emailResult };
};
